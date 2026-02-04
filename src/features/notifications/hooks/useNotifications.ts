'use client';

/**
 * Notifications Hook - Stub for Next.js migration
 * TODO: Full migration from web/src/features/notifications/hooks/useNotifications.ts
 */

export interface UseNotificationsReturn {
  notifications: never[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

export const useNotifications = (_autoRefresh: boolean = true): UseNotificationsReturn => {
  return {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    refreshNotifications: async () => {},
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    deleteNotification: async () => {},
    deleteAllNotifications: async () => {},
  };
};
