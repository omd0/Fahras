<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\FileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public data routes
Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::get('/programs', function () {
    return response()->json(\App\Models\Program::all());
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    // Project routes
    Route::apiResource('projects', ProjectController::class);
    
    // Advanced project features
    Route::get('/projects/search/global', [ProjectController::class, 'search']);
    Route::get('/projects/analytics', [ProjectController::class, 'analytics']);
    Route::get('/projects/suggestions', [ProjectController::class, 'suggestions']);
    
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
    Route::get('/notifications', [ProjectController::class, 'notifications']);
    Route::put('/notifications/{notification}/read', [ProjectController::class, 'markNotificationRead']);
    Route::put('/notifications/read-all', [ProjectController::class, 'markAllNotificationsRead']);
});
