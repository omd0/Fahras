<?php

namespace App\Domains\Projects\Controllers;

use App\Domains\Projects\Models\Project;
use App\Models\User;
use App\Models\Notification;
use App\Models\Comment;
use App\Models\Rating;
use App\Models\Bookmark;
use App\Domains\Projects\Services\ProjectActivityService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProjectController extends \App\Http\Controllers\Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::with([
            'program.department',
            'creator',
            'members',
            'advisors',
            'files' => function ($fileQuery) {
                $fileQuery->orderBy('uploaded_at', 'desc');
            },
        ]);
        
        // User authentication is now handled by OptionalAuthSanctum middleware
        // If a valid token is present, user will be authenticated; otherwise null (guest)
        $user = $request->user();

        // If requesting my_projects, skip visibility rules and show all user's projects
        $isMyProjects = $request->has('my_projects') && $request->boolean('my_projects');
        
        if (!$isMyProjects) {
            // Apply visibility rules based on user role
            if (!$user) {
                // Unauthenticated users: only see approved projects
                $query->where('admin_approval_status', 'approved');
            } elseif ($user->hasRole('admin') || $user->hasRole('reviewer')) {
                // Admin and Reviewer: can see all projects (including hidden ones)
                // No additional filtering needed
            } else {
                // Regular users: can see approved projects and their own projects (including hidden ones)
                $query->where(function ($q) use ($user) {
                    $q->where('admin_approval_status', 'approved')
                      ->orWhere('created_by_user_id', $user->id);
                });
            }
        }

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
        if ($request->has('my_projects') && $request->boolean('my_projects')) {
            $user = $request->user();
            
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
            
            // Include projects where user is creator OR member
            $query->where(function ($q) use ($user) {
                $q->where('created_by_user_id', $user->id)
                  ->orWhereHas('members', function ($memberQuery) use ($user) {
                      $memberQuery->where('user_id', $user->id);
                  });
            });
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

    public function store(Request $request): JsonResponse
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

        // Separate regular members and custom members
        $customMembers = [];
        $regularMembers = [];
        foreach ($request->members as $member) {
            if (!empty($member['customName'])) {
                $customMembers[] = [
                    'name' => $member['customName'],
                    'role' => $member['role']
                ];
            } elseif (!empty($member['user_id']) && $member['user_id'] > 0) {
                $regularMembers[] = $member;
            }
        }

        // Separate regular advisors and custom advisors
        $customAdvisors = [];
        $regularAdvisors = [];
        if ($request->has('advisors')) {
            foreach ($request->advisors as $advisor) {
                if (!empty($advisor['customName'])) {
                    $customAdvisors[] = [
                        'name' => $advisor['customName'],
                        'role' => $advisor['role']
                    ];
                } elseif (!empty($advisor['user_id']) && $advisor['user_id'] > 0) {
                    $regularAdvisors[] = $advisor;
                }
            }
        }

        $creator = $request->user();

        try {
            DB::beginTransaction();
            
            $project = Project::create([
                'program_id' => $request->program_id,
                'created_by_user_id' => $creator->id,
                'title' => $request->title,
                'abstract' => $request->abstract,
                'keywords' => $request->keywords ?? [],
                'academic_year' => $request->academic_year,
                'semester' => $request->semester,
                'status' => 'draft',
                'custom_members' => !empty($customMembers) ? $customMembers : null,
                'custom_advisors' => !empty($customAdvisors) ? $customAdvisors : null,
            ]);

            // Add regular members (with user_id)
            foreach ($regularMembers as $member) {
                $project->members()->attach($member['user_id'], [
                    'role_in_project' => $member['role']
                ]);
            }

            // Add regular advisors (with user_id)
            foreach ($regularAdvisors as $advisor) {
                $project->advisors()->attach($advisor['user_id'], [
                    'advisor_role' => $advisor['role']
                ]);
            }

            if ($creator->hasRole('faculty')) {
                $isCreatorAlreadyAdvisor = $project
                    ->advisors()
                    ->wherePivot('user_id', $creator->id)
                    ->exists();

                if (!$isCreatorAlreadyAdvisor) {
                    $advisorFound = collect($regularAdvisors)->firstWhere('user_id', $creator->id);
                    $advisorRole = $advisorFound ? ($advisorFound['role'] ?? 'MAIN') : 'MAIN';

                    $project->advisors()->attach($creator->id, [
                        'advisor_role' => $advisorRole,
                    ]);
                }
            }

            // Log project creation activity
            ProjectActivityService::logProjectCreated($project, $creator);

            DB::commit();

            return response()->json([
                'message' => 'Project created successfully',
                'project' => $project->load(['program', 'members', 'advisors'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Project creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $creator->id,
                'request_data' => $request->except(['password', 'token'])
            ]);

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

    public function show(Project $project): JsonResponse
    {
        $user = request()->user();
        
        // Apply visibility rules based on user role
        if (!$user) {
            // Unauthenticated users: only see approved projects
            if ($project->admin_approval_status !== 'approved') {
                return response()->json([
                    'message' => 'Project not found or not available'
                ], 404);
            }
        } elseif (!$user->hasRole('admin') && !$user->hasRole('reviewer')) {
            // Regular users: can see approved projects and their own projects (including hidden ones)
            if ($project->admin_approval_status !== 'approved' && $project->created_by_user_id !== $user->id) {
                return response()->json([
                    'message' => 'Project not found or not available'
                ], 404);
            }
        }
        // Admin and Reviewer: can see all projects (including hidden ones)
        
        $projectWithFiles = $project->load([
            'program.department',
            'creator',
            'members',
            'advisors'
        ]);

        // Merge regular members with custom members
        $members = $projectWithFiles->members->map(function($member) {
            return [
                'id' => $member->id,
                'full_name' => $member->full_name,
                'email' => $member->email,
                'pivot' => [
                    'role_in_project' => $member->pivot->role_in_project
                ]
            ];
        })->toArray();

        // Add custom members
        if ($project->custom_members) {
            foreach ($project->custom_members as $customMember) {
                $members[] = [
                    'id' => null,
                    'full_name' => $customMember['name'],
                    'email' => null,
                    'is_custom' => true,
                    'pivot' => [
                        'role_in_project' => $customMember['role']
                    ]
                ];
            }
        }

        // Merge regular advisors with custom advisors
        $advisors = $projectWithFiles->advisors->map(function($advisor) {
            return [
                'id' => $advisor->id,
                'full_name' => $advisor->full_name,
                'email' => $advisor->email,
                'pivot' => [
                    'advisor_role' => $advisor->pivot->advisor_role
                ]
            ];
        })->toArray();

        // Add custom advisors
        if ($project->custom_advisors) {
            foreach ($project->custom_advisors as $customAdvisor) {
                $advisors[] = [
                    'id' => null,
                    'full_name' => $customAdvisor['name'],
                    'email' => null,
                    'is_custom' => true,
                    'pivot' => [
                        'advisor_role' => $customAdvisor['role']
                    ]
                ];
            }
        }

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

    public function update(Request $request, Project $project): JsonResponse
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

        // Track status change for activity logging
        $oldStatus = $project->status;
        
        // Update basic project fields
        $project->update($request->only([
            'program_id', 'title', 'abstract', 'keywords', 'academic_year',
            'semester', 'status', 'is_public', 'doi', 'repo_url'
        ]));

        // Log status change if status was updated
        if ($request->has('status') && $oldStatus !== $project->status) {
            ProjectActivityService::logStatusChange($project, $request->user(), $oldStatus, $project->status);
        }

        // Log project update
        ProjectActivityService::logProjectUpdated($project, $request->user());

        // Update members if provided
        if ($request->has('members')) {
            // Separate regular members and custom members
            $customMembers = [];
            $regularMembers = [];
            foreach ($request->members as $member) {
                if (!empty($member['customName'])) {
                    $customMembers[] = [
                        'name' => $member['customName'],
                        'role' => $member['role']
                    ];
                } elseif (!empty($member['user_id']) && $member['user_id'] > 0) {
                    $regularMembers[$member['user_id']] = [
                        'role_in_project' => $member['role']
                    ];
                }
            }

            // Update custom members
            $project->update([
                'custom_members' => !empty($customMembers) ? $customMembers : null
            ]);

            // Sync regular members
            $project->members()->sync($regularMembers);
        }

        // Update advisors if provided
        if ($request->has('advisors')) {
            // Separate regular advisors and custom advisors
            $customAdvisors = [];
            $regularAdvisors = [];
            foreach ($request->advisors as $advisor) {
                if (!empty($advisor['customName'])) {
                    $customAdvisors[] = [
                        'name' => $advisor['customName'],
                        'role' => $advisor['role']
                    ];
                } elseif (!empty($advisor['user_id']) && $advisor['user_id'] > 0) {
                    $regularAdvisors[$advisor['user_id']] = [
                        'advisor_role' => $advisor['role']
                    ];
                }
            }

            // Update custom advisors
            $project->update([
                'custom_advisors' => !empty($customAdvisors) ? $customAdvisors : null
            ]);

            // Sync regular advisors
            $project->advisors()->sync($regularAdvisors);
        }

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project->load(['program', 'members', 'advisors'])
        ]);
    }

    public function destroy(Project $project): JsonResponse
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

    public function members(Project $project): JsonResponse
    {
        return response()->json([
            'members' => $project->members()->withPivot('role_in_project')->get()
        ]);
    }

    public function addMember(Request $request, Project $project): JsonResponse
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

    public function updateMember(Request $request, Project $project, User $user): JsonResponse
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

    public function removeMember(Project $project, User $user): JsonResponse
    {
        $project->members()->detach($user->id);

        return response()->json([
            'message' => 'Member removed successfully'
        ]);
    }

    /**
     * Global search across projects with advanced filtering
     */
    public function search(Request $request): JsonResponse
    {
        $query = Project::with([
            'program.department',
            'creator',
            'members',
            'advisors',
            'files' => function ($fileQuery) {
                $fileQuery->orderBy('uploaded_at', 'desc');
            },
        ]);
        $user = $request->user();

        // Apply visibility rules based on user role
        if (!$user) {
            // Unauthenticated users: only see approved projects
            $query->where('admin_approval_status', 'approved');
        } elseif ($user->hasRole('admin') || $user->hasRole('reviewer')) {
            // Admin and Reviewer: can see all projects (including hidden ones)
            // No additional filtering needed
        } else {
            // Regular users: can see approved projects and their own projects (including hidden ones)
            $query->where(function ($q) use ($user) {
                $q->where('admin_approval_status', 'approved')
                  ->orWhere('created_by_user_id', $user->id);
            });
        }

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
    public function analytics(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Helper function to create base query with user access filtering
        $createBaseQuery = function() use ($user) {
            $query = Project::query();
            
            // Apply visibility rules based on user role
            if (!$user) {
                // Unauthenticated users: only see approved projects
                $query->where('admin_approval_status', 'approved');
            } elseif ($user->hasRole('admin') || $user->hasRole('reviewer')) {
                // Admin and Reviewer: can see all projects (including hidden ones)
                // No additional filtering needed
            } else {
                // Regular users: can see approved projects and their own projects (including hidden ones)
                $query->where(function ($q) use ($user) {
                    $q->where('admin_approval_status', 'approved')
                      ->orWhere('created_by_user_id', $user->id)
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
    public function suggestions(Request $request): JsonResponse
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
     * Add a comment to a project
     */
    public function addComment(Request $request, Project $project): JsonResponse
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
    public function rateProject(Request $request, Project $project): JsonResponse
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
    public function getComments(Project $project): JsonResponse
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
    public function getRatings(Project $project): JsonResponse
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
    public function approveProject(Request $request, Project $project): JsonResponse
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

        $updateData = [
            'admin_approval_status' => 'approved',
            'approved_by_user_id' => $request->user()->id,
            'approved_at' => now(),
            'admin_notes' => $request->admin_notes,
        ];

        // If status is provided, update it as well
        if ($request->has('status')) {
            $updateData['status'] = $request->status;
        }

        $project->update($updateData);

        // Make all project files public when project is approved
        $project->files()->update(['is_public' => true]);

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
    public function hideProject(Request $request, Project $project): JsonResponse
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

        $project->update([
            'admin_approval_status' => 'hidden',
            'approved_by_user_id' => $request->user()->id,
            'approved_at' => now(),
            'admin_notes' => $request->admin_notes,
        ]);

        // Make all project files private when project is hidden
        $project->files()->update(['is_public' => false]);

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
    public function toggleProjectVisibility(Request $request, Project $project): JsonResponse
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

        // Toggle between approved and hidden
        $newStatus = $project->admin_approval_status === 'approved' ? 'hidden' : 'approved';
        
        $project->update([
            'admin_approval_status' => $newStatus,
            'approved_by_user_id' => $request->user()->id,
            'approved_at' => now(),
            'admin_notes' => $request->admin_notes,
        ]);

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
    public function adminPendingApprovals(Request $request): JsonResponse
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $query = Project::with([
            'program.department',
            'creator',
            'members',
            'advisors',
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
    public function adminProjects(Request $request): JsonResponse
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $query = Project::with([
            'program.department',
            'creator',
            'members',
            'advisors',
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
    public function bookmarkProject(Request $request, Project $project): JsonResponse
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
    public function getBookmarkedProjects(Request $request): JsonResponse
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
                    'program.department',
                    'creator',
                    'members',
                    'advisors',
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
    public function isBookmarked(Request $request, Project $project): JsonResponse
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
    public function syncGuestBookmarks(Request $request): JsonResponse
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
