<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Models\Notification;
use App\Models\Comment;
use App\Models\Rating;
use App\Models\Bookmark;
use App\Services\ProjectActivityService;
use App\Services\Project\ProjectService;
use App\Services\Project\ProjectMemberService;
use App\Services\Project\ProjectVisibilityService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    protected $projectService;
    protected $memberService;
    protected $visibilityService;

    public function __construct(
        ProjectService $projectService,
        ProjectMemberService $memberService,
        ProjectVisibilityService $visibilityService
    ) {
        $this->projectService = $projectService;
        $this->memberService = $memberService;
        $this->visibilityService = $visibilityService;
    }

    public function index(Request $request)
    {
        $query = Project::with([
            'program.department.faculty',
            'creator.roles',
            'members.roles',
            'advisors.roles',
            'files' => function ($fileQuery) {
                $fileQuery->orderBy('uploaded_at', 'desc');
            },
        ]);

        $user = $request->user();
        $isMyProjects = $request->has('my_projects') && $request->boolean('my_projects');

        // Apply visibility filters using service
        $this->visibilityService->applyVisibilityFilters($query, $user, $isMyProjects);

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

        if ($request->has('admin_approval_status')) {
            $query->where('admin_approval_status', $request->admin_approval_status);
        }

        if ($request->has('created_by')) {
            $query->where('created_by_user_id', $request->created_by);
        }

        // Filter for user's own projects
        if ($isMyProjects) {
            if (!$user) {
                // Return empty result if user is not authenticated when requesting my_projects
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $request->get('per_page', 15),
                    'total' => 0,
                    'has_more_pages' => false,
                    'search_metadata' => [
                        'total_results' => 0,
                        'current_page' => 1,
                        'per_page' => $request->get('per_page', 15),
                        'last_page' => 1,
                        'has_more_pages' => false,
                    ],
                ]);
            }

            $this->visibilityService->applyMyProjectsFilter($query, $user);
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

        // Add is_bookmarked field for authenticated users
        $user = $request->user();
        if ($user) {
            $projectIds = $projects->pluck('id')->toArray();
            $bookmarkedIds = Bookmark::where('user_id', $user->id)
                ->whereIn('project_id', $projectIds)
                ->pluck('project_id')
                ->toArray();
            
            $projects->getCollection()->transform(function ($project) use ($bookmarkedIds) {
                $project->is_bookmarked = in_array($project->id, $bookmarkedIds);
                return $project;
            });
        }

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
            'members.*.user_id' => 'nullable|integer',
            'members.*.customName' => 'nullable|string|max:255',
            'members.*.role' => 'required|in:LEAD,MEMBER',
            'advisors' => 'nullable|array',
            'advisors.*.user_id' => 'nullable|integer',
            'advisors.*.customName' => 'nullable|string|max:255',
            'advisors.*.role' => 'required|in:MAIN,CO_ADVISOR,REVIEWER',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate that each member has either a valid user_id or a customName
        foreach ($request->members as $index => $member) {
            if (empty($member['customName']) && (empty($member['user_id']) || $member['user_id'] <= 0)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => ["members.{$index}" => ['Each member must have either a valid user_id or a custom name']]
                ], 422);
            }
            // If user_id is provided and greater than 0, validate it exists
            if (!empty($member['user_id']) && $member['user_id'] > 0) {
                if (!User::find($member['user_id'])) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors' => ["members.{$index}.user_id" => ['The selected user does not exist']]
                    ], 422);
                }
            }
        }

        // Validate advisors similarly
        if ($request->has('advisors')) {
            foreach ($request->advisors as $index => $advisor) {
                if (empty($advisor['customName']) && (empty($advisor['user_id']) || $advisor['user_id'] <= 0)) {
                    return response()->json([
                        'message' => 'Validation failed',
                        'errors' => ["advisors.{$index}" => ['Each advisor must have either a valid user_id or a custom name']]
                    ], 422);
                }
                // If user_id is provided and greater than 0, validate it exists
                if (!empty($advisor['user_id']) && $advisor['user_id'] > 0) {
                    if (!User::find($advisor['user_id'])) {
                        return response()->json([
                            'message' => 'Validation failed',
                            'errors' => ["advisors.{$index}.user_id" => ['The selected user does not exist']]
                        ], 422);
                    }
                }
            }
        }

        // Separate members and advisors using service
        $membersSeparated = $this->memberService->separateMembers($request->members);
        $advisorsSeparated = $this->memberService->separateAdvisors($request->advisors ?? []);

        $creator = $request->user();

        try {
            $project = $this->projectService->createProject([
                'program_id' => $request->program_id,
                'title' => $request->title,
                'abstract' => $request->abstract,
                'keywords' => $request->keywords ?? [],
                'academic_year' => $request->academic_year,
                'semester' => $request->semester,
                'custom_members' => !empty($membersSeparated['custom_members']) ? $membersSeparated['custom_members'] : null,
                'custom_advisors' => !empty($advisorsSeparated['custom_advisors']) ? $advisorsSeparated['custom_advisors'] : null,
                'regular_members' => $membersSeparated['regular_members'],
                'regular_advisors' => $advisorsSeparated['regular_advisors'],
            ], $creator);

            return response()->json([
                'message' => 'Project created successfully',
                'project' => $project->load(['program', 'members', 'advisors'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create project',
                'error' => $e->getMessage(),
                'details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ] : null
            ], 500);
        }
    }

    public function show(Project $project)
    {
        $user = request()->user();

        // Check visibility using service
        if (!$this->visibilityService->canViewProject($project, $user)) {
            return response()->json([
                'message' => 'Project not found or not available'
            ], 404);
        }

        $projectWithFiles = $project->load([
            'program.department',
            'creator',
            'members',
            'advisors'
        ]);

        // Use member service to get merged members and advisors
        $members = $this->memberService->getMergedMembers($project);
        $advisors = $this->memberService->getMergedAdvisors($project);

        // Replace members and advisors with merged arrays
        $projectData = $projectWithFiles->toArray();
        $projectData['members'] = $members;
        $projectData['advisors'] = $advisors;

        // Load all files - no access control
        $projectData['files'] = $project->files()->orderBy('uploaded_at', 'desc')->get()->toArray();

        // Add is_bookmarked field for authenticated users
        if ($user) {
            $projectData['is_bookmarked'] = $project->isBookmarkedBy($user->id);
        }

        \Log::info('Project details requested', [
            'project_id' => $project->id,
            'user_id' => $user ? $user->id : 'guest',
            'files_count' => count($projectData['files']),
            'files' => array_map(function($file) {
                return [
                    'id' => $file['id'],
                    'original_filename' => $file['original_filename'],
                    'storage_url' => $file['storage_url']
                ];
            }, $projectData['files'])
        ]);

        return response()->json([
            'project' => $projectData
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
            'program_id' => 'sometimes|required|exists:programs,id',
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
            'members' => 'sometimes|array',
            'members.*.user_id' => 'nullable|integer',
            'members.*.customName' => 'nullable|string|max:255',
            'members.*.role' => 'required_with:members|in:LEAD,MEMBER',
            'advisors' => 'sometimes|array',
            'advisors.*.user_id' => 'nullable|integer',
            'advisors.*.customName' => 'nullable|string|max:255',
            'advisors.*.role' => 'required_with:advisors|in:MAIN,CO_ADVISOR,REVIEWER',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update project using service
        $project = $this->projectService->updateProject(
            $project,
            $request->only([
                'program_id', 'title', 'abstract', 'keywords', 'academic_year',
                'semester', 'status', 'is_public', 'doi', 'repo_url'
            ]),
            $request->user()
        );

        // Update members if provided
        if ($request->has('members')) {
            $this->memberService->syncMembers($project, $request->members);
        }

        // Update advisors if provided
        if ($request->has('advisors')) {
            $this->memberService->syncAdvisors($project, $request->advisors);
        }

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

        $this->projectService->deleteProject($project);

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

        $this->memberService->addMember($project, $request->user_id, $request->role);

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

        $this->memberService->updateMemberRole($project, $user->id, $request->role);

        return response()->json([
            'message' => 'Member role updated successfully'
        ]);
    }

    public function removeMember(Project $project, User $user)
    {
        $this->memberService->removeMember($project, $user->id);

        return response()->json([
            'message' => 'Member removed successfully'
        ]);
    }

    /**
     * Global search across projects with advanced filtering
     */
    public function search(Request $request)
    {
        $query = Project::with([
            'program.department.faculty',
            'creator.roles',
            'members.roles',
            'advisors.roles',
            'files' => function ($fileQuery) {
                $fileQuery->orderBy('uploaded_at', 'desc');
            },
        ]);
        $user = $request->user();

        // Apply visibility filters using service
        $this->visibilityService->applyVisibilityFilters($query, $user);

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
            return $this->visibilityService->createAnalyticsBaseQuery($user);
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
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        $comment = Comment::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'content' => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        // Log comment activity
        ProjectActivityService::logCommentAdded($project, $user, $comment);

        // Create notifications for project advisors and creator
        $title = 'New Comment on Project';
        $message = "{$user->full_name} commented on \"{$project->title}\": \"{$request->content}\"";

        // Notify advisors
        Notification::createForProjectAdvisors($project, 'comment', $title, $message, [
            'comment_id' => $comment->id,
            'content' => $request->content,
            'commenter_name' => $user->full_name,
            'commenter_id' => $user->id,
        ]);

        // Notify project creator if they're not the one commenting
        if ($project->created_by_user_id !== $user->id) {
            Notification::createForProjectCreator($project, 'comment', $title, $message, [
                'comment_id' => $comment->id,
                'content' => $request->content,
                'commenter_name' => $user->full_name,
                'commenter_id' => $user->id,
            ]);
        }

        // Load the comment with user relationship
        $comment->load('user');

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => $comment
        ], 201);
    }

    /**
     * Rate a project
     */
    public function rateProject(Request $request, Project $project)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Update or create rating (one rating per user per project)
        $rating = Rating::updateOrCreate(
            [
                'project_id' => $project->id,
                'user_id' => $user->id,
            ],
            [
                'rating' => $request->rating,
                'review' => $request->review,
            ]
        );

        // Create notifications for project advisors and creator
        $title = 'Project Rated';
        $message = "{$user->full_name} rated \"{$project->title}\" with {$request->rating} star(s)";
        if ($request->review) {
            $message .= ": \"{$request->review}\"";
        }

        // Notify advisors
        Notification::createForProjectAdvisors($project, 'rating', $title, $message, [
            'rating_id' => $rating->id,
            'rating' => $request->rating,
            'review' => $request->review,
            'rater_name' => $user->full_name,
            'rater_id' => $user->id,
        ]);

        // Notify project creator if they're not the one rating
        if ($project->created_by_user_id !== $user->id) {
            Notification::createForProjectCreator($project, 'rating', $title, $message, [
                'rating_id' => $rating->id,
                'rating' => $request->rating,
                'review' => $request->review,
                'rater_name' => $user->full_name,
                'rater_id' => $user->id,
            ]);
        }

        // Load the rating with user relationship
        $rating->load('user');

        return response()->json([
            'message' => 'Project rated successfully',
            'rating' => $rating
        ], 201);
    }

    /**
     * Get comments for a project
     */
    public function getComments(Project $project)
    {
        $comments = $project->comments()
            ->with(['user', 'replies.user'])
            ->get();

        return response()->json([
            'comments' => $comments
        ]);
    }

    /**
     * Get ratings for a project
     */
    public function getRatings(Project $project)
    {
        $ratings = $project->ratings()
            ->with('user')
            ->get();

        $averageRating = $project->getAverageRating();
        $totalRatings = $project->getTotalRatings();

        return response()->json([
            'ratings' => $ratings,
            'average_rating' => $averageRating ? round($averageRating, 1) : null,
            'total_ratings' => $totalRatings
        ]);
    }

    /**
     * Approve a project (admin only)
     */
    public function approveProject(Request $request, Project $project)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'admin_notes' => 'nullable|string|max:1000',
            'status' => 'nullable|in:draft,submitted,under_review,approved,rejected,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Use service to approve project
        $project = $this->projectService->approveProject(
            $project,
            $request->user(),
            $request->admin_notes,
            $request->status ?? null
        );

        // Create notification for project creator
        Notification::createForProjectCreator($project, 'approval', 'Project Approved', 
            "Your project \"{$project->title}\" has been approved and is now visible to everyone.", [
                'approval_status' => 'approved',
                'admin_notes' => $request->admin_notes,
                'approved_by' => $request->user()->full_name,
            ]);

        return response()->json([
            'message' => 'Project approved successfully',
            'project' => $project->load(['program', 'members', 'advisors', 'approver'])
        ]);
    }

    /**
     * Hide a project (admin only)
     */
    public function hideProject(Request $request, Project $project)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Use service to hide project
        $project = $this->projectService->hideProject(
            $project,
            $request->user(),
            $request->admin_notes
        );

        // Create notification for project creator
        Notification::createForProjectCreator($project, 'approval', 'Project Hidden', 
            "Your project \"{$project->title}\" has been hidden from public view.", [
                'approval_status' => 'hidden',
                'admin_notes' => $request->admin_notes,
                'approved_by' => $request->user()->full_name,
            ]);

        return response()->json([
            'message' => 'Project hidden successfully',
            'project' => $project->load(['program', 'members', 'advisors', 'approver'])
        ]);
    }

    /**
     * Toggle project visibility between approved and hidden (admin only)
     */
    public function toggleProjectVisibility(Request $request, Project $project)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Use service to toggle visibility
        $result = $this->projectService->toggleProjectVisibility(
            $project,
            $request->user(),
            $request->admin_notes
        );
        $project = $result['project'];
        $newStatus = $result['new_status'];

        // Create notification for project creator
        $action = $newStatus === 'approved' ? 'Approved' : 'Hidden';
        $message = $newStatus === 'approved' 
            ? "Your project \"{$project->title}\" has been approved and is now visible to everyone."
            : "Your project \"{$project->title}\" has been hidden from public view.";

        Notification::createForProjectCreator($project, 'approval', "Project {$action}", $message, [
            'approval_status' => $newStatus,
            'admin_notes' => $request->admin_notes,
            'approved_by' => $request->user()->full_name,
        ]);

        return response()->json([
            'message' => "Project {$newStatus} successfully",
            'project' => $project->load(['program', 'members', 'advisors', 'approver'])
        ]);
    }

    /**
     * Get projects pending approval (admin only)
     */
    public function adminPendingApprovals(Request $request)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $query = Project::with([
            'program.department.faculty',
            'creator.roles',
            'members.roles',
            'advisors.roles',
            'files' => function ($fileQuery) {
                $fileQuery->orderBy('uploaded_at', 'desc');
            },
        ])
            ->where('admin_approval_status', 'pending');

        // Apply filters
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

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSortFields = ['created_at', 'updated_at', 'title', 'academic_year'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
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
            ]
        ]);
    }

    /**
     * Get all projects with approval status (admin only)
     */
    public function adminProjects(Request $request)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $query = Project::with([
            'program.department.faculty',
            'creator.roles',
            'members.roles',
            'advisors.roles',
            'approver',
            'files' => function ($fileQuery) {
                $fileQuery->orderBy('uploaded_at', 'desc');
            },
        ]);

        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('admin_approval_status', $request->approval_status);
        }

        // Apply other filters (same as index method)
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

        if ($request->has('created_by')) {
            $query->where('created_by_user_id', $request->created_by);
        }

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('abstract', 'ilike', "%{$search}%")
                  ->orWhereJsonContains('keywords', $search);
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSortFields = ['created_at', 'updated_at', 'title', 'academic_year', 'admin_approval_status', 'approved_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
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
            ]
        ]);
    }

    /**
     * Bookmark a project
     */
    public function bookmarkProject(Request $request, Project $project)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('project_id', $project->id)
            ->first();

        if ($bookmark) {
            // Unbookmark
            $bookmark->delete();
            return response()->json([
                'message' => 'Project unbookmarked successfully',
                'is_bookmarked' => false
            ]);
        } else {
            // Bookmark
            Bookmark::create([
                'user_id' => $user->id,
                'project_id' => $project->id,
            ]);
            return response()->json([
                'message' => 'Project bookmarked successfully',
                'is_bookmarked' => true
            ]);
        }
    }

    /**
     * Get user's bookmarked projects
     */
    public function getBookmarkedProjects(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $bookmarks = Bookmark::where('user_id', $user->id)
            ->with(['project' => function ($query) {
                $query->with([
                    'program.department.faculty',
                    'creator.roles',
                    'members.roles',
                    'advisors.roles',
                    'files' => function ($fileQuery) {
                        $fileQuery->orderBy('uploaded_at', 'desc');
                    },
                ]);
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $projects = $bookmarks->map(function ($bookmark) {
            $project = $bookmark->project->toArray();
            $project['is_bookmarked'] = true;
            return $project;
        });

        return response()->json([
            'data' => $projects,
            'total' => $projects->count()
        ]);
    }

    /**
     * Check if project is bookmarked
     */
    public function isBookmarked(Request $request, Project $project)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'is_bookmarked' => false
            ]);
        }

        $isBookmarked = $project->isBookmarkedBy($user->id);

        return response()->json([
            'is_bookmarked' => $isBookmarked
        ]);
    }

    /**
     * Sync guest bookmarks to user account
     */
    public function syncGuestBookmarks(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'guest_bookmark_ids' => 'required|array',
            'guest_bookmark_ids.*' => 'required|integer|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $guestBookmarkIds = $request->guest_bookmark_ids;
        
        // Get existing bookmarks for the user
        $existingBookmarkIds = Bookmark::where('user_id', $user->id)
            ->pluck('project_id')
            ->toArray();

        // Merge and remove duplicates
        $allBookmarkIds = array_unique(array_merge($existingBookmarkIds, $guestBookmarkIds));

        // Create bookmarks for IDs that don't exist
        $newBookmarkIds = array_diff($allBookmarkIds, $existingBookmarkIds);
        
        foreach ($newBookmarkIds as $projectId) {
            // Validate project exists and is accessible
            $project = Project::find($projectId);
            if ($project && ($project->admin_approval_status === 'approved' || $project->created_by_user_id === $user->id)) {
                Bookmark::firstOrCreate([
                    'user_id' => $user->id,
                    'project_id' => $projectId,
                ]);
            }
        }

        $syncedCount = count($newBookmarkIds);

        return response()->json([
            'message' => 'Bookmarks synced successfully',
            'synced_count' => $syncedCount,
            'total_bookmarks' => count($allBookmarkIds)
        ]);
    }
}
