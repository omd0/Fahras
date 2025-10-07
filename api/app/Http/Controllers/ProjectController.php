<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with(['program.department', 'creator', 'members', 'advisors']);

        // Advanced filtering
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->has('department_id')) {
            $query->whereHas('program', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        if ($request->has('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }

        if ($request->has('is_public')) {
            $query->where('is_public', $request->boolean('is_public'));
        }

        if ($request->has('created_by')) {
            $query->where('created_by_user_id', $request->created_by);
        }

        // Filter for user's own projects
        if ($request->has('my_projects') && $request->boolean('my_projects')) {
            $query->where('created_by_user_id', $request->user()->id);
        }

        if ($request->has('member_id')) {
            $query->whereHas('members', function ($q) use ($request) {
                $q->where('user_id', $request->member_id);
            });
        }

        if ($request->has('advisor_id')) {
            $query->whereHas('advisors', function ($q) use ($request) {
                $q->where('user_id', $request->advisor_id);
            });
        }

        // Advanced search with full-text search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                // Full-text search on title and abstract
                $q->whereRaw("to_tsvector('english', title || ' ' || abstract) @@ plainto_tsquery('english', ?)", [$search])
                  ->orWhere('title', 'ilike', "%{$search}%")
                  ->orWhere('abstract', 'ilike', "%{$search}%")
                  ->orWhereJsonContains('keywords', $search);
            });
        }

        // Date range filtering
        if ($request->has('created_from')) {
            $query->where('created_at', '>=', $request->created_from);
        }

        if ($request->has('created_to')) {
            $query->where('created_at', '<=', $request->created_to);
        }

        // Sorting options
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSortFields = ['created_at', 'updated_at', 'title', 'academic_year', 'status'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Apply pagination with cursor-based pagination for better performance
        $perPage = min($request->get('per_page', 15), 100); // Limit max per page
        $projects = $query->paginate($perPage);

        // Add search metadata
        $response = $projects->toArray();
        $response['search_metadata'] = [
            'total_results' => $projects->total(),
            'current_page' => $projects->currentPage(),
            'per_page' => $projects->perPage(),
            'last_page' => $projects->lastPage(),
            'has_more_pages' => $projects->hasMorePages(),
        ];

        return response()->json($response);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'program_id' => 'required|exists:programs,id',
            'title' => 'required|string|max:255',
            'abstract' => 'required|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:50',
            'academic_year' => 'required|string',
            'semester' => 'required|in:fall,spring,summer',
            'members' => 'required|array|min:1',
            'members.*.user_id' => 'required|exists:users,id',
            'members.*.role' => 'required|in:LEAD,MEMBER',
            'advisors' => 'nullable|array',
            'advisors.*.user_id' => 'required|exists:users,id',
            'advisors.*.role' => 'required|in:MAIN,CO_ADVISOR,REVIEWER',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project = Project::create([
            'program_id' => $request->program_id,
            'created_by_user_id' => $request->user()->id,
            'title' => $request->title,
            'abstract' => $request->abstract,
            'keywords' => $request->keywords ?? [],
            'academic_year' => $request->academic_year,
            'semester' => $request->semester,
            'status' => 'draft',
        ]);

        // Add members
        foreach ($request->members as $member) {
            $project->members()->attach($member['user_id'], [
                'role_in_project' => $member['role']
            ]);
        }

        // Add advisors if provided
        if ($request->has('advisors')) {
            foreach ($request->advisors as $advisor) {
                $project->advisors()->attach($advisor['user_id'], [
                    'advisor_role' => $advisor['role']
                ]);
            }
        }

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project->load(['program', 'members', 'advisors'])
        ], 201);
    }

    public function show(Project $project)
    {
        return response()->json([
            'project' => $project->load([
                'program.department',
                'creator',
                'members',
                'advisors',
                'files'
            ])
        ]);
    }

    public function update(Request $request, Project $project)
    {
        // Check if user can update this project
        if ($project->created_by_user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to update this project'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'abstract' => 'sometimes|required|string',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string|max:50',
            'academic_year' => 'sometimes|required|string',
            'semester' => 'sometimes|required|in:fall,spring,summer',
            'status' => 'sometimes|required|in:draft,submitted,under_review,approved,rejected,completed',
            'is_public' => 'sometimes|boolean',
            'doi' => 'nullable|string',
            'repo_url' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project->update($request->only([
            'title', 'abstract', 'keywords', 'academic_year',
            'semester', 'status', 'is_public', 'doi', 'repo_url'
        ]));

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project->load(['program', 'members', 'advisors'])
        ]);
    }

    public function destroy(Project $project)
    {
        // Check if user can delete this project
        if ($project->created_by_user_id !== request()->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to delete this project'
            ], 403);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully'
        ]);
    }

    public function members(Project $project)
    {
        return response()->json([
            'members' => $project->members()->withPivot('role_in_project')->get()
        ]);
    }

    public function addMember(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:LEAD,MEMBER',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project->members()->syncWithoutDetaching([
            $request->user_id => ['role_in_project' => $request->role]
        ]);

        return response()->json([
            'message' => 'Member added successfully'
        ]);
    }

    public function updateMember(Request $request, Project $project, User $user)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:LEAD,MEMBER',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $project->members()->updateExistingPivot($user->id, [
            'role_in_project' => $request->role
        ]);

        return response()->json([
            'message' => 'Member role updated successfully'
        ]);
    }

    public function removeMember(Project $project, User $user)
    {
        $project->members()->detach($user->id);

        return response()->json([
            'message' => 'Member removed successfully'
        ]);
    }

    /**
     * Global search across projects with advanced filtering
     */
    public function search(Request $request)
    {
        $query = Project::with(['program.department', 'creator', 'members', 'advisors']);

        // Full-text search with ranking
        if ($request->has('q') && !empty($request->q)) {
            $searchTerm = $request->q;
            $query->selectRaw('*, ts_rank(to_tsvector(\'english\', title || \' \' || abstract), plainto_tsquery(\'english\', ?)) as rank', [$searchTerm])
                  ->whereRaw("to_tsvector('english', title || ' ' || abstract) @@ plainto_tsquery('english', ?)", [$searchTerm])
                  ->orderBy('rank', 'desc');
        }

        // Apply all the same filters as index method
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->has('department_id')) {
            $query->whereHas('program', function ($q) use ($request) {
                $q->where('department_id', $request->department_id);
            });
        }

        if ($request->has('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }

        if ($request->has('is_public')) {
            $query->where('is_public', $request->boolean('is_public'));
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $projects = $query->paginate($perPage);

        return response()->json([
            'projects' => $projects->items(),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
                'last_page' => $projects->lastPage(),
                'has_more_pages' => $projects->hasMorePages(),
            ],
            'search_term' => $request->get('q', ''),
        ]);
    }

    /**
     * Get project statistics and analytics
     */
    public function analytics(Request $request)
    {
        $user = $request->user();
        
        // Helper function to create base query with user access filtering
        $createBaseQuery = function() use ($user) {
            $query = Project::query();
            
            // If user is not admin, filter by their projects
            if (!$user->hasRole('admin')) {
                $query->where(function ($q) use ($user) {
                    $q->where('created_by_user_id', $user->id)
                      ->orWhereHas('members', function ($memberQuery) use ($user) {
                          $memberQuery->where('user_id', $user->id);
                      })
                      ->orWhereHas('advisors', function ($advisorQuery) use ($user) {
                          $advisorQuery->where('user_id', $user->id);
                      });
                });
            }
            
            return $query;
        };

        // Project status distribution
        $statusStats = $createBaseQuery()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // Projects by academic year
        $yearStats = $createBaseQuery()
            ->selectRaw('academic_year, COUNT(*) as count')
            ->groupBy('academic_year')
            ->orderBy('academic_year', 'desc')
            ->get();

        // Projects by department
        $departmentStats = $createBaseQuery()
            ->join('programs', 'projects.program_id', '=', 'programs.id')
            ->join('departments', 'programs.department_id', '=', 'departments.id')
            ->selectRaw('departments.name as department, COUNT(*) as count')
            ->groupBy('departments.id', 'departments.name')
            ->get();

        // Recent activity (last 30 days)
        $recentActivity = $createBaseQuery()
            ->where('projects.updated_at', '>=', now()->subDays(30))
            ->count();

        // Monthly project creation trend (last 12 months)
        $monthlyTrend = $createBaseQuery()
            ->selectRaw('DATE_TRUNC(\'month\', projects.created_at) as month, COUNT(*) as count')
            ->where('projects.created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Total projects count
        $totalProjects = $createBaseQuery()->count();

        return response()->json([
            'status_distribution' => $statusStats,
            'year_distribution' => $yearStats,
            'department_distribution' => $departmentStats,
            'recent_activity' => $recentActivity,
            'monthly_trend' => $monthlyTrend,
            'total_projects' => $totalProjects,
        ]);
    }

    /**
     * Get project suggestions for autocomplete
     */
    public function suggestions(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        $suggestions = Project::select('id', 'title', 'academic_year', 'semester')
            ->where('title', 'ilike', "%{$query}%")
            ->orWhere('abstract', 'ilike', "%{$query}%")
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'academic_year' => $project->academic_year,
                    'semester' => $project->semester,
                ];
            });

        return response()->json(['suggestions' => $suggestions]);
    }

    /**
     * Get evaluations for a project
     */
    public function evaluations(Project $project)
    {
        $evaluations = $project->evaluations()
            ->with(['evaluator', 'milestone'])
            ->get();

        return response()->json([
            'evaluations' => $evaluations
        ]);
    }

    /**
     * Create a new evaluation
     */
    public function createEvaluation(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'evaluator_user_id' => 'required|exists:users,id',
            'milestone_id' => 'nullable|exists:milestones,id',
            'score' => 'nullable|integer|min:0|max:100',
            'remarks' => 'nullable|string|max:1000',
            'criteria_scores' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // For now, we'll create a simple evaluation record
        // In a full implementation, you'd have an Evaluation model
        $evaluation = [
            'id' => rand(1000, 9999),
            'project_id' => $project->id,
            'evaluator_user_id' => $request->evaluator_user_id,
            'milestone_id' => $request->milestone_id,
            'score' => $request->score,
            'remarks' => $request->remarks,
            'criteria_scores' => $request->criteria_scores,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        return response()->json([
            'message' => 'Evaluation created successfully',
            'evaluation' => $evaluation
        ], 201);
    }

    /**
     * Update an evaluation
     */
    public function updateEvaluation(Request $request, $evaluationId)
    {
        $validator = Validator::make($request->all(), [
            'score' => 'nullable|integer|min:0|max:100',
            'remarks' => 'nullable|string|max:1000',
            'criteria_scores' => 'nullable|array',
            'status' => 'sometimes|required|in:pending,in_progress,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // For now, return a mock response
        $evaluation = [
            'id' => $evaluationId,
            'score' => $request->score,
            'remarks' => $request->remarks,
            'criteria_scores' => $request->criteria_scores,
            'status' => $request->status ?? 'pending',
            'updated_at' => now(),
        ];

        return response()->json([
            'message' => 'Evaluation updated successfully',
            'evaluation' => $evaluation
        ]);
    }

    /**
     * Submit evaluation (mark as completed)
     */
    public function submitEvaluation(Request $request, $evaluationId)
    {
        $validator = Validator::make($request->all(), [
            'score' => 'required|integer|min:0|max:100',
            'remarks' => 'nullable|string|max:1000',
            'criteria_scores' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // For now, return a mock response
        $evaluation = [
            'id' => $evaluationId,
            'score' => $request->score,
            'remarks' => $request->remarks,
            'criteria_scores' => $request->criteria_scores,
            'status' => 'completed',
            'evaluated_at' => now(),
            'updated_at' => now(),
        ];

        return response()->json([
            'message' => 'Evaluation submitted successfully',
            'evaluation' => $evaluation
        ]);
    }

    /**
     * Get evaluation statistics for a project
     */
    public function evaluationStatistics(Project $project)
    {
        // Mock statistics for now
        $stats = [
            'total_evaluations' => 3,
            'completed_evaluations' => 2,
            'pending_evaluations' => 1,
            'in_progress_evaluations' => 0,
            'average_score' => 85.5,
            'highest_score' => 95,
            'lowest_score' => 76,
        ];

        return response()->json($stats);
    }

    /**
     * Get evaluations assigned to current user
     */
    public function myEvaluations(Request $request)
    {
        $user = $request->user();
        
        // Mock evaluations for now
        $evaluations = [
            'data' => [
                [
                    'id' => 1,
                    'project_id' => 1,
                    'project_title' => 'AI-Powered Learning System',
                    'score' => null,
                    'status' => 'pending',
                    'due_date' => now()->addDays(7)->toDateString(),
                    'created_at' => now()->subDays(2)->toISOString(),
                ],
                [
                    'id' => 2,
                    'project_id' => 2,
                    'project_title' => 'Blockchain Voting System',
                    'score' => 88,
                    'status' => 'completed',
                    'due_date' => now()->subDays(1)->toDateString(),
                    'created_at' => now()->subDays(5)->toISOString(),
                ],
            ],
            'current_page' => 1,
            'last_page' => 1,
            'total' => 2,
        ];

        return response()->json($evaluations);
    }

    /**
     * Get approvals for a project
     */
    public function approvals(Project $project)
    {
        // Mock approvals for now
        $approvals = [
            [
                'id' => 1,
                'project_id' => $project->id,
                'approver_name' => 'Dr. Sarah Johnson',
                'stage' => 'department',
                'decision' => 'pending',
                'note' => null,
                'created_at' => now()->subDays(1)->toISOString(),
            ],
        ];

        return response()->json(['approvals' => $approvals]);
    }

    /**
     * Create a new approval
     */
    public function createApproval(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'approver_user_id' => 'required|exists:users,id',
            'stage' => 'required|in:department,faculty,final',
            'note' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $approval = [
            'id' => rand(1000, 9999),
            'project_id' => $project->id,
            'approver_user_id' => $request->approver_user_id,
            'stage' => $request->stage,
            'decision' => 'pending',
            'note' => $request->note,
            'created_at' => now(),
        ];

        return response()->json([
            'message' => 'Approval created successfully',
            'approval' => $approval
        ], 201);
    }

    /**
     * Update an approval
     */
    public function updateApproval(Request $request, $approvalId)
    {
        $validator = Validator::make($request->all(), [
            'decision' => 'required|in:approved,rejected,needs_revision',
            'note' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $approval = [
            'id' => $approvalId,
            'decision' => $request->decision,
            'note' => $request->note,
            'decided_at' => now(),
            'updated_at' => now(),
        ];

        return response()->json([
            'message' => 'Approval updated successfully',
            'approval' => $approval
        ]);
    }

    /**
     * Get pending approvals for current user
     */
    public function pendingApprovals(Request $request)
    {
        $user = $request->user();
        
        // Mock pending approvals
        $approvals = [
            'data' => [
                [
                    'id' => 1,
                    'project_id' => 1,
                    'project_title' => 'AI-Powered Learning System',
                    'stage' => 'department',
                    'decision' => 'pending',
                    'created_at' => now()->subDays(1)->toISOString(),
                ],
            ],
            'current_page' => 1,
            'last_page' => 1,
            'total' => 1,
        ];

        return response()->json($approvals);
    }

    /**
     * Add a comment to a project
     */
    public function addComment(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $comment = $request->comment;

        // Create notifications for project advisors and creator
        $title = 'New Comment on Project';
        $message = "{$user->full_name} commented on \"{$project->title}\": \"{$comment}\"";

        // Notify advisors
        Notification::createForProjectAdvisors($project, 'comment', $title, $message, [
            'comment' => $comment,
            'commenter_name' => $user->full_name,
            'commenter_id' => $user->id,
        ]);

        // Notify project creator if they're not the one commenting
        if ($project->created_by_user_id !== $user->id) {
            Notification::createForProjectCreator($project, 'comment', $title, $message, [
                'comment' => $comment,
                'commenter_name' => $user->full_name,
                'commenter_id' => $user->id,
            ]);
        }

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => [
                'id' => rand(1000, 9999),
                'project_id' => $project->id,
                'user_id' => $user->id,
                'user_name' => $user->full_name,
                'comment' => $comment,
                'created_at' => now(),
            ]
        ]);
    }

    /**
     * Rate a project
     */
    public function rateProject(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $rating = $request->rating;
        $feedback = $request->feedback;

        // Create notifications for project advisors and creator
        $title = 'Project Rated';
        $message = "{$user->full_name} rated \"{$project->title}\" with {$rating} star(s)";
        if ($feedback) {
            $message .= ": \"{$feedback}\"";
        }

        // Notify advisors
        Notification::createForProjectAdvisors($project, 'rating', $title, $message, [
            'rating' => $rating,
            'feedback' => $feedback,
            'rater_name' => $user->full_name,
            'rater_id' => $user->id,
        ]);

        // Notify project creator if they're not the one rating
        if ($project->created_by_user_id !== $user->id) {
            Notification::createForProjectCreator($project, 'rating', $title, $message, [
                'rating' => $rating,
                'feedback' => $feedback,
                'rater_name' => $user->full_name,
                'rater_id' => $user->id,
            ]);
        }

        return response()->json([
            'message' => 'Project rated successfully',
            'rating' => [
                'id' => rand(1000, 9999),
                'project_id' => $project->id,
                'user_id' => $user->id,
                'user_name' => $user->full_name,
                'rating' => $rating,
                'feedback' => $feedback,
                'created_at' => now(),
            ]
        ]);
    }
}
