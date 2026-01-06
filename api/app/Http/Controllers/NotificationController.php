<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = $user->notifications()->with('project');
        
        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Filter by read status if provided
        if ($request->has('is_read')) {
            $query->where('is_read', $request->boolean('is_read'));
        }
        
        // Sort by created_at desc (newest first)
        $query->orderBy('created_at', 'desc');
        
        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $notifications = $query->paginate($perPage);
        
        // Get unread count
        $unreadCount = $user->notifications()->where('is_read', false)->count();
        
        return response()->json([
            'notifications' => $notifications->items(),
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
                'has_more_pages' => $notifications->hasMorePages(),
            ],
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = $user->notifications()->where('is_read', false)->count();
        
        return response()->json(['unread_count' => $count]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, $notificationId): JsonResponse
    {
        $user = $request->user();
        
        $notification = $user->notifications()->findOrFail($notificationId);
        $notification->markAsRead();
        
        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $user->notifications()
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        
        return response()->json([
            'message' => 'All notifications marked as read'
        ]);
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, $notificationId): JsonResponse
    {
        $user = $request->user();
        
        $notification = $user->notifications()->findOrFail($notificationId);
        $notification->delete();
        
        return response()->json([
            'message' => 'Notification deleted successfully'
        ]);
    }

    /**
     * Delete all notifications
     */
    public function destroyAll(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $user->notifications()->delete();
        
        return response()->json([
            'message' => 'All notifications deleted successfully'
        ]);
    }
}
