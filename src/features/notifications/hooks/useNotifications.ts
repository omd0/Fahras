'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';
import { getErrorMessage, getErrorStatus } from '@/utils/errorHandling';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  project?: {
    id: number;
    title: string;
    slug?: string;
  };
}

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

const POLL_INTERVAL = 30000; // 30 seconds

export const useNotifications = (autoRefresh: boolean = true): UseNotificationsReturn => {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getNotifications();
      const notifs = (response.notifications || []) as Notification[];
      setNotifications(notifs);
      setUnreadCount(response.unread_count ?? 0);
    } catch (err: unknown) {
      if (getErrorStatus(err) === 401) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      setError(getErrorMessage(err, 'Failed to fetch notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await apiService.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to mark notification as read'));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to mark all notifications as read'));
    }
  }, []);

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        await apiService.deleteNotification(notificationId);
        setNotifications(prev => {
          const deleted = prev.find(n => n.id === notificationId);
          if (deleted && !deleted.is_read) {
            setUnreadCount(c => Math.max(0, c - 1));
          }
          return prev.filter(n => n.id !== notificationId);
        });
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to delete notification'));
      }
    },
    [],
  );

  const deleteAllNotifications = useCallback(async () => {
    try {
      await apiService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete all notifications'));
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    refreshNotifications();

    if (autoRefresh) {
      pollRef.current = setInterval(refreshNotifications, POLL_INTERVAL);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, autoRefresh, refreshNotifications]);

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
