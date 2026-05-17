import { create } from 'zustand';
import { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random()}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 3000,
    };

    set((state) => ({
      notifications: [...state.notifications, fullNotification],
    }));

    // Auto-remove after duration
    if (fullNotification.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, fullNotification.duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

// Helper hooks for common notifications
export function useNotification() {
  const { addNotification } = useNotificationStore();

  return {
    success: (title: string, message?: string) =>
      addNotification({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addNotification({ type: 'error', title, message, duration: 5000 }),
    warning: (title: string, message?: string) =>
      addNotification({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      addNotification({ type: 'info', title, message }),
  };
}

/**
 * Real-time event listeners for notifications
 * Subscribe to database events and trigger notifications
 */
export function useRealtimeNotifications() {
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Listen for budget warnings
    window.addEventListener('budget-warning', ((event: any) => {
      addNotification({
        type: 'warning',
        title: '⚠️ Budget Alert',
        message: event.detail?.message || 'Project approaching budget limit',
      });
    }) as EventListener);

    // Listen for overdue invoices
    window.addEventListener('invoice-overdue', ((event: any) => {
      addNotification({
        type: 'error',
        title: '💰 Overdue Invoice',
        message: event.detail?.message || 'Invoice payment is overdue',
        duration: 0, // Persistent
      });
    }) as EventListener);

    // Listen for new messages
    window.addEventListener('new-message', ((event: any) => {
      addNotification({
        type: 'info',
        title: '💬 New Message',
        message: event.detail?.message || 'You have a new message',
      });
    }) as EventListener);

    // Listen for project updates
    window.addEventListener('project-updated', ((event: any) => {
      addNotification({
        type: 'info',
        title: '📋 Project Update',
        message: event.detail?.message || 'Project has been updated',
      });
    }) as EventListener);

    // Listen for approval requests
    window.addEventListener('approval-needed', ((event: any) => {
      addNotification({
        type: 'warning',
        title: '✋ Approval Required',
        message: event.detail?.message || 'An item needs your approval',
        action: {
          label: 'Review',
          onClick: () => {
            window.location.href = '/approvals';
          },
        },
      });
    }) as EventListener);

    return () => {
      window.removeEventListener('budget-warning', undefined as any);
      window.removeEventListener('invoice-overdue', undefined as any);
      window.removeEventListener('new-message', undefined as any);
      window.removeEventListener('project-updated', undefined as any);
      window.removeEventListener('approval-needed', undefined as any);
    };
  }, [addNotification]);
}

/**
 * Dispatch custom notification events
 */
export const notificationEvents = {
  budgetWarning: (message: string) => {
    window.dispatchEvent(new CustomEvent('budget-warning', { detail: { message } }));
  },
  invoiceOverdue: (message: string) => {
    window.dispatchEvent(new CustomEvent('invoice-overdue', { detail: { message } }));
  },
  newMessage: (message: string) => {
    window.dispatchEvent(new CustomEvent('new-message', { detail: { message } }));
  },
  projectUpdated: (message: string) => {
    window.dispatchEvent(new CustomEvent('project-updated', { detail: { message } }));
  },
  approvalNeeded: (message: string) => {
    window.dispatchEvent(new CustomEvent('approval-needed', { detail: { message } }));
  },
};
