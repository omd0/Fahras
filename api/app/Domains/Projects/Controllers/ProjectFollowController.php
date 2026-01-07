<?php

namespace App\Domains\Projects\Controllers;

use App\Domains\Projects\Models\Project;
use App\Domains\Projects\Models\ProjectActivity;
use App\Domains\Projects\Models\ProjectFollower;
use App\Domains\Projects\Models\ProjectFlag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProjectFollowController extends \App\Http\Controllers\Controller
{
    /**
     * Get project activities (activity feed)
     */
    public function getActivities(Request $request, Project $project): JsonResponse
    {
        $query = $project->activities()->with(['user']);

        // Filter by activity type
        if ($request->has('activity_type')) {
            $query->where('activity_type', $request->activity_type);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Pagination
        $perPage = min($request->get('per_page', 20), 100);
        $activities = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'activities' => $activities->items(),
            'pagination' => [
                'current_page' => $activities->currentPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
                'last_page' => $activities->lastPage(),
            ]
        ]);
    }

    /**
     * Get timeline view (chronological events)
     */
    public function getTimeline(Project $project): JsonResponse
    {
        // Get all activities grouped by date
        $activities = $project->activities()
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($activity) {
                return $activity->created_at->format('Y-m-d');
            });

        // Get milestones
        $milestones = $project->milestones()
            ->with('templateItem')
            ->orderBy('order')
            ->get();

        // Get status changes from activities
        $statusChanges = $project->activities()
            ->where('activity_type', 'status_change')
            ->with(['user'])
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'activities_by_date' => $activities,
            'milestones' => $milestones,
            'status_changes' => $statusChanges,
        ]);
    }

    /**
     * Follow a project
     */
    public function followProject(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        // Check if already following
        if ($project->isFollowedBy($user->id)) {
            return response()->json([
                'message' => 'You are already following this project'
            ], 422);
        }

        $follower = ProjectFollower::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'notification_preferences' => $request->notification_preferences ?? [
                'milestone_due' => true,
                'milestone_completed' => true,
                'status_change' => true,
                'new_comment' => true,
                'file_upload' => true,
            ],
        ]);

        return response()->json([
            'message' => 'You are now following this project',
            'follower' => $follower->load('user')
        ], 201);
    }

    /**
     * Unfollow a project
     */
    public function unfollowProject(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        $follower = ProjectFollower::where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$follower) {
            return response()->json([
                'message' => 'You are not following this project'
            ], 422);
        }

        $follower->delete();

        return response()->json([
            'message' => 'You have unfollowed this project'
        ], 200);
    }

    /**
     * Get project followers
     */
    public function getFollowers(Project $project): JsonResponse
    {
        $followers = $project->followers()
            ->with('user')
            ->get();

        return response()->json([
            'followers' => $followers
        ]);
    }

    /**
     * Create a project flag (early warning)
     */
    public function createFlag(Request $request, Project $project): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'flag_type' => 'required|in:scope_creep,technical_blocker,team_conflict,resource_shortage,timeline_risk,other',
            'severity' => 'required|in:low,medium,high,critical',
            'message' => 'required|string|max:1000',
            'is_confidential' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $flag = ProjectFlag::create([
            'project_id' => $project->id,
            'flagged_by_user_id' => $user->id,
            'flag_type' => $request->flag_type,
            'severity' => $request->severity,
            'message' => $request->message,
            'is_confidential' => $request->boolean('is_confidential', false),
        ]);

        // TODO: Send notification to advisors/admins about the flag

        return response()->json([
            'message' => 'Flag created successfully',
            'flag' => $flag->load(['flaggedBy'])
        ], 201);
    }

    /**
     * Resolve a flag
     */
    public function resolveFlag(Request $request, ProjectFlag $flag): JsonResponse
    {
        if ($flag->isResolved()) {
            return response()->json([
                'message' => 'Flag is already resolved'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'resolution_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Only admins and advisors can resolve flags
        $isAdmin = $user->roles()->where('name', 'admin')->exists();
        $isAdvisor = $flag->project->advisors()->where('user_id', $user->id)->exists();

        if (!$isAdmin && !$isAdvisor) {
            return response()->json([
                'message' => 'Only admins and advisors can resolve flags'
            ], 403);
        }

        $flag->resolve($user, $request->resolution_notes);

        return response()->json([
            'message' => 'Flag resolved successfully',
            'flag' => $flag->load(['resolvedBy'])
        ]);
    }

    /**
     * Get project flags
     */
    public function getFlags(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();
        $isAdmin = $user->roles()->where('name', 'admin')->exists();
        $isAdvisor = $project->advisors()->where('user_id', $user->id)->exists();
        $isProjectOwner = $project->created_by_user_id === $user->id;

        $query = $project->flags()->with(['flaggedBy', 'resolvedBy']);

        // Filter by resolved status
        if ($request->has('resolved')) {
            if ($request->boolean('resolved')) {
                $query->whereNotNull('resolved_at');
            } else {
                $query->whereNull('resolved_at');
            }
        }

        // Filter by severity
        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        // Filter by flag type
        if ($request->has('flag_type')) {
            $query->where('flag_type', $request->flag_type);
        }

        $flags = $query->orderBy('created_at', 'desc')->get();

        // Filter confidential flags - only show to admins/advisors
        if (!$isAdmin && !$isAdvisor) {
            $flags = $flags->filter(function ($flag) use ($isProjectOwner) {
                // Show own flags or non-confidential flags
                return !$flag->is_confidential || $flag->flagged_by_user_id === request()->user()->id;
            });
        }

        return response()->json([
            'flags' => $flags->values()
        ]);
    }
}

