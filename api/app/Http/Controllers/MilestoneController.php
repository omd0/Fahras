<?php

namespace App\Http\Controllers;

use App\Domains\Projects\Models\Project;
use App\Domains\Projects\Models\ProjectMilestone;
use App\Services\ProjectActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MilestoneController extends Controller
{
    /**
     * Display a listing of milestones for a project
     */
    public function index(Project $project): JsonResponse
    {
        $milestones = $project->milestones()
            ->with('templateItem')
            ->orderBy('order')
            ->get();

        return response()->json([
            'milestones' => $milestones
        ]);
    }

    /**
     * Store a newly created milestone
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'exists:project_milestones,id',
            'order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate circular dependencies
        if ($request->has('dependencies')) {
            if ($this->hasCircularDependency($project->id, $request->dependencies)) {
                return response()->json([
                    'message' => 'Circular dependency detected'
                ], 422);
            }
        }

        $maxOrder = $project->milestones()->max('order') ?? -1;
        $order = $request->order ?? ($maxOrder + 1);

        $milestone = ProjectMilestone::create([
            'project_id' => $project->id,
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date ? Carbon::parse($request->due_date) : null,
            'dependencies' => $request->dependencies ?? null,
            'order' => $order,
            'status' => 'not_started',
        ]);

        // Update blocked status based on dependencies
        $this->updateBlockedStatus($milestone);

        // Log activity
        ProjectActivityService::logMilestoneUpdated($project, $request->user(), $milestone, ['title' => $request->title]);

        return response()->json([
            'message' => 'Milestone created successfully',
            'milestone' => $milestone
        ], 201);
    }

    /**
     * Update the specified milestone
     */
    public function update(Request $request, ProjectMilestone $milestone): JsonResponse
    {
        $project = $milestone->project;

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'exists:project_milestones,id',
            'order' => 'integer',
            'completion_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate circular dependencies if dependencies are being updated
        if ($request->has('dependencies')) {
            if ($this->hasCircularDependency($project->id, $request->dependencies, $milestone->id)) {
                return response()->json([
                    'message' => 'Circular dependency detected'
                ], 422);
            }
        }

        $changes = [];
        $oldData = $milestone->toArray();

        if ($request->has('title') && $request->title !== $milestone->title) {
            $changes['title'] = $request->title;
        }
        if ($request->has('description') && $request->description !== $milestone->description) {
            $changes['description'] = $request->description;
        }
        if ($request->has('due_date')) {
            $newDueDate = $request->due_date ? Carbon::parse($request->due_date) : null;
            if ($newDueDate != $milestone->due_date) {
                $changes['due_date'] = $newDueDate;
            }
        }
        if ($request->has('dependencies')) {
            $changes['dependencies'] = $request->dependencies;
        }
        if ($request->has('order')) {
            $changes['order'] = $request->order;
        }
        if ($request->has('completion_notes')) {
            $changes['completion_notes'] = $request->completion_notes;
        }

        $milestone->update($request->only([
            'title', 'description', 'due_date', 'dependencies', 'order', 'completion_notes'
        ]));

        // Update blocked status
        $this->updateBlockedStatus($milestone);

        // Log activity
        if (!empty($changes)) {
            ProjectActivityService::logMilestoneUpdated($project, $request->user(), $milestone, $changes);
        }

        return response()->json([
            'message' => 'Milestone updated successfully',
            'milestone' => $milestone->fresh()
        ]);
    }

    /**
     * Remove the specified milestone
     */
    public function destroy(ProjectMilestone $milestone): JsonResponse
    {
        $project = $milestone->project;

        // Check if this milestone is a dependency for others
        $dependents = ProjectMilestone::where('project_id', $project->id)
            ->whereJsonContains('dependencies', $milestone->id)
            ->count();

        if ($dependents > 0) {
            return response()->json([
                'message' => 'Cannot delete milestone. It is a dependency for ' . $dependents . ' other milestone(s).'
            ], 422);
        }

        $milestoneTitle = $milestone->title;
        $milestone->delete();

        return response()->json([
            'message' => 'Milestone deleted successfully'
        ], 200);
    }

    /**
     * Start a milestone
     */
    public function start(ProjectMilestone $milestone): JsonResponse
    {
        $project = $milestone->project;

        if ($milestone->status === 'in_progress') {
            return response()->json([
                'message' => 'Milestone is already in progress'
            ], 422);
        }

        if ($milestone->status === ProjectStatus::COMPLETED) {
            return response()->json([
                'message' => 'Cannot start a completed milestone. Use reopen instead.'
            ], 422);
        }

        // Check if dependencies are met
        if (!$milestone->canStart()) {
            $incompleteDeps = $milestone->getDependentMilestones()
                ->filter(fn($m) => !$m->isCompleted())
                ->pluck('title')
                ->toArray();

            return response()->json([
                'message' => 'Cannot start milestone. Dependencies not met.',
                'incomplete_dependencies' => $incompleteDeps
            ], 422);
        }

        $milestone->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        // Log activity
        ProjectActivityService::logMilestoneStarted($project, request()->user(), $milestone);

        return response()->json([
            'message' => 'Milestone started successfully',
            'milestone' => $milestone->fresh()
        ]);
    }

    /**
     * Mark milestone as completed
     */
    public function markComplete(Request $request, ProjectMilestone $milestone): JsonResponse
    {
        $project = $milestone->project;

        if ($milestone->status === ProjectStatus::COMPLETED) {
            return response()->json([
                'message' => 'Milestone is already completed'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'completion_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $milestone->update([
            'status' => ProjectStatus::COMPLETED,
            'completed_at' => now(),
            'completion_notes' => $request->completion_notes,
        ]);

        // Log activity
        ProjectActivityService::logMilestoneCompleted($project, request()->user(), $milestone);

        // Check and update dependent milestones
        $this->updateDependentMilestones($project, $milestone);

        return response()->json([
            'message' => 'Milestone completed successfully',
            'milestone' => $milestone->fresh()
        ]);
    }

    /**
     * Reopen a completed milestone
     */
    public function reopen(ProjectMilestone $milestone): JsonResponse
    {
        $project = $milestone->project;

        if ($milestone->status !== ProjectStatus::COMPLETED) {
            return response()->json([
                'message' => 'Only completed milestones can be reopened'
            ], 422);
        }

        $milestone->update([
            'status' => 'in_progress',
            'completed_at' => null,
        ]);

        // Log activity
        ProjectActivityService::logMilestoneUpdated($project, request()->user(), $milestone, ['status' => 'reopened']);

        // Update dependent milestones that might now be blocked
        $this->updateDependentMilestones($project, $milestone);

        return response()->json([
            'message' => 'Milestone reopened successfully',
            'milestone' => $milestone->fresh()
        ]);
    }

    /**
     * Update milestone due date
     */
    public function updateDueDate(Request $request, ProjectMilestone $milestone): JsonResponse
    {
        $project = $milestone->project;

        $validator = Validator::make($request->all(), [
            'due_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldDueDate = $milestone->due_date;
        $milestone->update([
            'due_date' => Carbon::parse($request->due_date)
        ]);

        // Log activity
        ProjectActivityService::logMilestoneUpdated($project, request()->user(), $milestone, [
            'due_date' => $request->due_date
        ]);

        return response()->json([
            'message' => 'Due date updated successfully',
            'milestone' => $milestone->fresh()
        ]);
    }

    /**
     * Get timeline view with dependencies
     */
    public function getTimeline(Project $project): JsonResponse
    {
        $milestones = $project->milestones()
            ->with('templateItem')
            ->orderBy('order')
            ->get();

        // Build dependency links for visualization
        $links = [];
        foreach ($milestones as $milestone) {
            if (!empty($milestone->dependencies)) {
                foreach ($milestone->dependencies as $dependencyId) {
                    $links[] = [
                        'source' => $dependencyId,
                        'target' => $milestone->id,
                        'type' => 'finish_to_start' // Gantt dependency type
                    ];
                }
            }
        }

        return response()->json([
            'milestones' => $milestones,
            'links' => $links,
        ]);
    }

    /**
     * Check for circular dependencies
     */
    private function hasCircularDependency($projectId, array $dependencies, $excludeMilestoneId = null): bool
    {
        if (empty($dependencies)) {
            return false;
        }

        $visited = [];
        $recursionStack = [];

        foreach ($dependencies as $depId) {
            if ($this->isCyclicUtil($projectId, $depId, $visited, $recursionStack, $excludeMilestoneId)) {
                return true;
            }
        }

        return false;
    }

    /**
     * DFS utility to detect cycles
     */
    private function isCyclicUtil($projectId, $milestoneId, &$visited, &$recursionStack, $excludeMilestoneId = null): bool
    {
        if ($milestoneId == $excludeMilestoneId) {
            return false; // Exclude the milestone being updated
        }

        $visited[$milestoneId] = true;
        $recursionStack[$milestoneId] = true;

        $milestone = ProjectMilestone::where('project_id', $projectId)
            ->where('id', $milestoneId)
            ->first();

        if ($milestone && !empty($milestone->dependencies)) {
            foreach ($milestone->dependencies as $depId) {
                if (!isset($visited[$depId])) {
                    if ($this->isCyclicUtil($projectId, $depId, $visited, $recursionStack, $excludeMilestoneId)) {
                        return true;
                    }
                } elseif (isset($recursionStack[$depId])) {
                    return true; // Cycle detected
                }
            }
        }

        unset($recursionStack[$milestoneId]);
        return false;
    }

    /**
     * Update blocked status based on dependencies
     */
    private function updateBlockedStatus(ProjectMilestone $milestone): void
    {
        if (empty($milestone->dependencies)) {
            if ($milestone->status === 'blocked') {
                $milestone->update(['status' => 'not_started']);
            }
            return;
        }

        $canStart = $milestone->canStart();
        if (!$canStart && $milestone->status === 'not_started') {
            $milestone->update(['status' => 'blocked']);
        } elseif ($canStart && $milestone->status === 'blocked') {
            $milestone->update(['status' => 'not_started']);
        }
    }

    /**
     * Update dependent milestones when a milestone completes
     */
    private function updateDependentMilestones(Project $project, ProjectMilestone $completedMilestone): void
    {
        $dependentMilestones = ProjectMilestone::where('project_id', $project->id)
            ->whereJsonContains('dependencies', $completedMilestone->id)
            ->get();

        foreach ($dependentMilestones as $milestone) {
            $this->updateBlockedStatus($milestone);
        }
    }
}

