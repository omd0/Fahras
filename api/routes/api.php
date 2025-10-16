<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\NotificationController;
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

Route::get('/departments', function () {
    return response()->json(\App\Models\Department::all());
});

Route::get('/faculties', function () {
    return response()->json(\App\Models\Faculty::all());
});

Route::get('/users', function () {
    return response()->json(\App\Models\User::all());
});

// Public project routes (for unauthenticated users)
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{project}', [ProjectController::class, 'show']);

// Public project interaction routes (read-only for unauthenticated users)
Route::get('/projects/{project}/comments', [ProjectController::class, 'getComments']);
Route::get('/projects/{project}/ratings', [ProjectController::class, 'getRatings']);

// Public file download route (for approved projects only)
Route::get('/files/{file}/download', [FileController::class, 'download']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    
    // Profile management routes
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [AuthController::class, 'deleteAvatar']);

    // Advanced project features (must be before resource routes)
    Route::get('/projects/search/global', [ProjectController::class, 'search']);
    Route::get('/projects/analytics', [ProjectController::class, 'analytics']);
    Route::get('/projects/suggestions', [ProjectController::class, 'suggestions']);
    
    // Project routes (protected actions only)
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    
    // Project member routes
    Route::get('/projects/{project}/members', [ProjectController::class, 'members']);
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
    Route::put('/projects/{project}/members/{user}', [ProjectController::class, 'updateMember']);
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);

    // Pending approval count (admin and faculty)
    Route::get('/projects/pending-count', [ProjectController::class, 'getPendingApprovalCount']);

    // File routes
    Route::post('/projects/{project}/files', [FileController::class, 'upload']);
    Route::get('/projects/{project}/files', [FileController::class, 'index']);
    Route::delete('/files/{file}', [FileController::class, 'destroy']);

    // Document export routes
    Route::get('/projects/{project}/export', [App\Http\Controllers\DocumentExportController::class, 'export']);

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

    // Project interaction routes (comments and ratings) - write operations only
    Route::post('/projects/{project}/comments', [ProjectController::class, 'addComment']);
    Route::post('/projects/{project}/rate', [ProjectController::class, 'rateProject']);

    // Admin-only project approval routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/projects/{project}/approve', [ProjectController::class, 'approveProject']);
        Route::post('/projects/{project}/hide', [ProjectController::class, 'hideProject']);
        Route::post('/projects/{project}/toggle-visibility', [ProjectController::class, 'toggleProjectVisibility']);
        Route::get('/admin/projects', [ProjectController::class, 'adminProjects']);
        Route::get('/admin/projects/pending', [ProjectController::class, 'adminPendingApprovals']);
        Route::get('/admin/projects/pending-count', [ProjectController::class, 'adminPendingApprovalCount']);
    });
});
