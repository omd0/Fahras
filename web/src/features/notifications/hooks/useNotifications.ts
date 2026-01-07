import { useState, useEffect, useCallback } from 'react';
import { notificationService, Notification } from '@/features/notifications/api/notificationApi';
import { useAuthStore } from '@/features/auth/store';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

export const useNotifications = (autoRefresh: boolean = true): UseNotificationsReturn => {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
    } catch (err: any) {
      // Ignore 401 errors (unauthenticated) - this is expected for public pages
      if (err?.response?.status === 401) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
    }
  }, [notifications]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to delete all notifications');
    }
  }, []);

  useEffect(() => {
    // Only fetch notifications if user is authenticated
    if (isAuthenticated) {
      // Initial load
      refreshNotifications();

      if (autoRefresh) {
        // Start polling for authenticated users
        notificationService.startPolling();
        
        // Set up notification service callbacks
        notificationService.setCallbacks({
          onNotificationReceived: (notification) => {
            setNotifications(prev => [notification, ...prev]);
            if (!notification.is_read) {
              setUnreadCount(prev => prev + 1);
            }
          },
          onUnreadCountChanged: (count) => {
            setUnreadCount(count);
          },
          onError: (err: any) => {
            // Ignore 401 errors (unauthenticated)
            if (err?.response?.status !== 401) {
              setError(err.message);
            }
          },
        });
      }
    } else {
      // Stop polling if user is not authenticated
      notificationService.stopPolling();
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
    }

    return () => {
      if (autoRefresh && isAuthenticated) {
        notificationService.setCallbacks({});
      }
    };
  }, [autoRefresh, refreshNotifications, isAuthenticated]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};
