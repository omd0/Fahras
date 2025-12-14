import { apiService } from './api';

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
  };
}

export interface NotificationServiceCallbacks {
  onNotificationReceived?: (notification: Notification) => void;
  onUnreadCountChanged?: (count: number) => void;
  onError?: (error: Error) => void;
}

class NotificationService {
  private callbacks: NotificationServiceCallbacks = {};
  private pollInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private lastPollTime: Date | null = null;
  private readonly POLL_INTERVAL = 30000; // 30 seconds

  constructor() {
    // Don't start polling automatically - wait for authenticated user
    // Polling will be started by useNotifications hook when user is authenticated
  }

  /**
   * Set callbacks for notification events
   */
  setCallbacks(callbacks: NotificationServiceCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Start polling for new notifications
   */
  startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;
    this.pollInterval = setInterval(() => {
      this.checkForNewNotifications();
    }, this.POLL_INTERVAL);
  }

  /**
   * Stop polling for notifications
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
  }

  /**
   * Check for new notifications
   */
  private async checkForNewNotifications() {
    try {
      const response = await apiService.getNotifications({
        per_page: 10,
        page: 1,
      });

      // If this is the first poll, just store the time
      if (!this.lastPollTime) {
        this.lastPollTime = new Date();
        return;
      }

      // Check for new notifications since last poll
      const newNotifications = response.notifications.filter(notification => {
        const notificationTime = new Date(notification.created_at);
        return notificationTime > this.lastPollTime!;
      });

      // Notify about new notifications
      newNotifications.forEach(notification => {
        this.callbacks.onNotificationReceived?.(notification);
      });

      // Update unread count
      this.callbacks.onUnreadCountChanged?.(response.unread_count);

      this.lastPollTime = new Date();
    } catch (error: any) {
      // Ignore 401 errors (unauthenticated) - this is expected for public pages
      if (error?.response?.status === 401) {
        // Stop polling if we get 401 - user is not authenticated
        this.stopPolling();
        return;
      }
      console.error('Failed to check for notifications:', error);
      // Only call onError for non-401 errors
      if (error?.response?.status !== 401) {
        this.callbacks.onError?.(error as Error);
      }
    }
  }

  /**
   * Get current unread count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiService.getUnreadCount();
      return response.unread_count;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Get notifications with pagination
   */
  async getNotifications(params?: {
    type?: string;
    is_read?: boolean;
    per_page?: number;
    page?: number;
  }) {
    try {
      return await apiService.getNotifications(params);
    } catch (error) {
      console.error('Failed to get notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number) {
    try {
      await apiService.markNotificationRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      await apiService.markAllNotificationsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: number) {
    try {
      await apiService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications() {
    try {
      await apiService.deleteAllNotifications();
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopPolling();
    this.callbacks = {};
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();

// Export the class for testing
export { NotificationService };
