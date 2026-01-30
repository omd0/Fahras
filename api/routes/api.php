<?php

use App\Http\Controllers\AuthController;
use App\Domains\Projects\Controllers\ProjectController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\MilestoneTemplateController;
use App\Http\Controllers\MilestoneController;
use App\Domains\Projects\Controllers\ProjectFollowController;
use App\Http\Controllers\SavedSearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Email verification routes (public)
Route::post('/email/send-verification', [AuthController::class, 'sendVerificationEmail']);
Route::post('/email/verify', [AuthController::class, 'verifyEmail']);
Route::get('/email/verify-magic/{token}', [AuthController::class, 'verifyMagicLink']);

// Password reset routes (public)
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public data routes
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::get('/programs', function () {
    return response()->json(\App\Models\Program::with('department')->get());
});

Route::get('/departments', function () {
    return response()->json(\App\Models\Department::all());
});

Route::get('/faculties', function () {
    return response()->json(\App\Models\Faculty::all());
});

// Public user listing (for admin panel - will be protected in middleware)
Route::get('/users', [UserController::class, 'index']);
Route::get('/roles', [UserController::class, 'getRoles']);

// Public project routes (accessible to guests, but will authenticate if token is provided)
Route::get('/projects', [ProjectController::class, 'index'])->middleware('auth.optional');

// Specific project routes (must be before the generic {project} route)
Route::get('/projects/analytics', [ProjectController::class, 'analytics'])->middleware('auth:sanctum');
Route::get('/projects/search/global', [ProjectController::class, 'search'])->middleware('auth:sanctum');
Route::get('/projects/suggestions', [ProjectController::class, 'suggestions'])->middleware('auth:sanctum');
Route::get('/projects/bookmarked', [ProjectController::class, 'getBookmarkedProjects'])->middleware('auth:sanctum');

// Public project view route (accessible to guests, but will authenticate if token is provided)
Route::get('/projects/{project}', [ProjectController::class, 'show'])->middleware('auth.optional');

// Public project interaction routes (comments and ratings) - read-only for guests
Route::get('/projects/{project}/comments', [ProjectController::class, 'getComments']);
Route::get('/projects/{project}/ratings', [ProjectController::class, 'getRatings']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // Profile management routes
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [AuthController::class, 'deleteAvatar']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    
    // Email verification routes (authenticated)
    Route::post('/email/resend-verification', [AuthController::class, 'resendVerificationEmail']);

    // Advanced project features are now defined above as public routes with auth middleware
    
    // Project routes (excluding GET /projects and GET /projects/{project} which are public)
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    
    // Project member routes
    Route::get('/projects/{project}/members', [ProjectController::class, 'members']);
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
    Route::put('/projects/{project}/members/{user}', [ProjectController::class, 'updateMember']);
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);

    // File routes
    Route::post('/projects/{project}/files', [FileController::class, 'upload']);
    Route::get('/projects/{project}/files', [FileController::class, 'index']);
    Route::get('/files/{file}/download', [FileController::class, 'download']);
    Route::delete('/files/{file}', [FileController::class, 'destroy']);

    // Evaluation routes
    Route::get('/projects/{project}/evaluations', [ProjectController::class, 'evaluations']);
    Route::post('/projects/{project}/evaluations', [ProjectController::class, 'createEvaluation']);
    Route::put('/evaluations/{evaluation}', [ProjectController::class, 'updateEvaluation']);
    Route::post('/evaluations/{evaluation}/submit', [ProjectController::class, 'submitEvaluation']);
    Route::get('/projects/{project}/evaluations/statistics', [ProjectController::class, 'evaluationStatistics']);
    Route::get('/my-evaluations', [ProjectController::class, 'myEvaluations']);

    // Approval routes
    Route::get('/projects/{project}/approvals', [ProjectController::class, 'approvals']);
    Route::post('/projects/{project}/approvals', [ProjectController::class, 'createApproval']);
    Route::put('/approvals/{approval}', [ProjectController::class, 'updateApproval']);
    Route::get('/pending-approvals', [ProjectController::class, 'pendingApprovals']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);

    // Project interaction routes (comments and ratings) - write operations require auth
    Route::post('/projects/{project}/comments', [ProjectController::class, 'addComment']);
    Route::post('/projects/{project}/rate', [ProjectController::class, 'rateProject']);

    // Bookmark routes (note: GET /projects/bookmarked is defined above, before {project} wildcard route)
    Route::post('/projects/{project}/bookmark', [ProjectController::class, 'bookmarkProject']);
    Route::delete('/projects/{project}/bookmark', [ProjectController::class, 'bookmarkProject']);
    Route::get('/projects/{project}/is-bookmarked', [ProjectController::class, 'isBookmarked']);
    Route::post('/bookmarks/sync', [ProjectController::class, 'syncGuestBookmarks']);

    // Admin-only project approval routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/projects/{project}/approve', [ProjectController::class, 'approveProject']);
        Route::post('/projects/{project}/hide', [ProjectController::class, 'hideProject']);
        Route::post('/projects/{project}/toggle-visibility', [ProjectController::class, 'toggleProjectVisibility']);
        Route::get('/admin/projects', [ProjectController::class, 'adminProjects']);
        Route::get('/admin/projects/pending', [ProjectController::class, 'adminPendingApprovals']);
    });

    // User management routes (admin only)
    Route::prefix('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/permissions', [RoleController::class, 'getPermissions']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::put('/users/{user}/status', [UserController::class, 'toggleStatus']);
        
        // Role management routes
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{role}', [RoleController::class, 'update']);
        Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
    });

    // Milestone Template routes (admin/faculty only)
    Route::get('/milestone-templates', [MilestoneTemplateController::class, 'index']);
    Route::post('/milestone-templates', [MilestoneTemplateController::class, 'store']);
    Route::get('/milestone-templates/{milestoneTemplate}', [MilestoneTemplateController::class, 'show']);
    Route::put('/milestone-templates/{milestoneTemplate}', [MilestoneTemplateController::class, 'update']);
    Route::delete('/milestone-templates/{milestoneTemplate}', [MilestoneTemplateController::class, 'destroy']);
    Route::get('/milestone-templates/{milestoneTemplate}/items', [MilestoneTemplateController::class, 'getItems']);
    Route::post('/milestone-templates/{milestoneTemplate}/items', [MilestoneTemplateController::class, 'addItem']);
    Route::put('/milestone-template-items/{milestoneTemplateItem}', [MilestoneTemplateController::class, 'updateItem']);
    Route::delete('/milestone-template-items/{milestoneTemplateItem}', [MilestoneTemplateController::class, 'deleteItem']);
    Route::put('/milestone-templates/{milestoneTemplate}/items/reorder', [MilestoneTemplateController::class, 'reorderItems']);
    Route::post('/milestone-templates/{milestoneTemplate}/apply-to-project', [MilestoneTemplateController::class, 'applyToProject']);

    // Project Milestone routes
    Route::get('/projects/{project}/milestones', [MilestoneController::class, 'index']);
    Route::post('/projects/{project}/milestones', [MilestoneController::class, 'store']);
    Route::put('/milestones/{milestone}', [MilestoneController::class, 'update']);
    Route::delete('/milestones/{milestone}', [MilestoneController::class, 'destroy']);
    Route::post('/milestones/{milestone}/start', [MilestoneController::class, 'start']);
    Route::post('/milestones/{milestone}/complete', [MilestoneController::class, 'markComplete']);
    Route::post('/milestones/{milestone}/reopen', [MilestoneController::class, 'reopen']);
    Route::put('/milestones/{milestone}/due-date', [MilestoneController::class, 'updateDueDate']);
    Route::get('/projects/{project}/milestones/timeline', [MilestoneController::class, 'getTimeline']);

    // Project Follow routes
    Route::get('/projects/{project}/activities', [ProjectFollowController::class, 'getActivities']);
    Route::get('/projects/{project}/activities/timeline', [ProjectFollowController::class, 'getTimeline']);
    Route::post('/projects/{project}/follow', [ProjectFollowController::class, 'followProject']);
    Route::delete('/projects/{project}/follow', [ProjectFollowController::class, 'unfollowProject']);
    Route::get('/projects/{project}/followers', [ProjectFollowController::class, 'getFollowers']);
    Route::post('/projects/{project}/flags', [ProjectFollowController::class, 'createFlag']);
    Route::put('/flags/{flag}/resolve', [ProjectFollowController::class, 'resolveFlag']);
    Route::get('/projects/{project}/flags', [ProjectFollowController::class, 'getFlags']);

    // Saved Search routes
    Route::get('/saved-searches', [SavedSearchController::class, 'index']);
    Route::post('/saved-searches', [SavedSearchController::class, 'store']);
    Route::get('/saved-searches/{savedSearch}', [SavedSearchController::class, 'show']);
    Route::put('/saved-searches/{savedSearch}', [SavedSearchController::class, 'update']);
    Route::delete('/saved-searches/{savedSearch}', [SavedSearchController::class, 'destroy']);
    Route::post('/saved-searches/{savedSearch}/use', [SavedSearchController::class, 'recordUsage']);
    Route::post('/saved-searches/{savedSearch}/set-default', [SavedSearchController::class, 'setDefault']);
});
