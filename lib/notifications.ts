/**
 * Notifications & Reminders System
 * Manages project notifications and reminders for follow-ups, overdue tasks, etc.
 */

import type { WorkspaceProject } from "@/lib/workspaceTypes";

export interface Notification {
  id: string;
  projectId: string;
  type: "follow_up" | "overdue_task" | "unfinished_quote" | "status_change" | "reminder";
  title: string;
  message: string;
  icon: string;
  priority: "low" | "medium" | "high";
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  reminderDate?: Date; // When to show the reminder
}

export interface RemindersConfig {
  followUpAfterDays: number;
  overdueTaskReminder: boolean;
  unfinishedQuoteReminder: boolean;
  dailyDigest: boolean;
}

const NOTIFICATIONS_KEY = "workspace_notifications";
const CONFIG_KEY = "workspace_reminders_config";

/**
 * Get default reminders configuration
 */
export function getDefaultConfig(): RemindersConfig {
  return {
    followUpAfterDays: 7,
    overdueTaskReminder: true,
    unfinishedQuoteReminder: true,
    dailyDigest: true,
  };
}

/**
 * Get reminders configuration
 */
export function getRemindersConfig(): RemindersConfig {
  if (typeof window === "undefined") return getDefaultConfig();
  const data = localStorage.getItem(CONFIG_KEY);
  return data ? JSON.parse(data) : getDefaultConfig();
}

/**
 * Update reminders configuration
 */
export function updateRemindersConfig(config: Partial<RemindersConfig>): void {
  if (typeof window === "undefined") return;
  const current = getRemindersConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
}

/**
 * Get all notifications
 */
export function getAllNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Get unread notifications
 */
export function getUnreadNotifications(): Notification[] {
  return getAllNotifications().filter((n) => !n.isRead);
}

/**
 * Get notifications for a project
 */
export function getProjectNotifications(projectId: string): Notification[] {
  return getAllNotifications().filter((n) => n.projectId === projectId);
}

/**
 * Create notification
 */
export function createNotification(
  projectId: string,
  type: Notification["type"],
  title: string,
  message: string,
  priority: "low" | "medium" | "high" = "medium",
  actionUrl?: string
): Notification {
  const notifications = getAllNotifications();

  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    projectId,
    type,
    title,
    message,
    icon: getIconForType(type),
    priority,
    isRead: false,
    actionUrl,
    createdAt: new Date(),
  };

  notifications.push(notification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));

  return notification;
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): void {
  const notifications = getAllNotifications();
  const notification = notifications.find((n) => n.id === notificationId);

  if (notification) {
    notification.isRead = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
}

/**
 * Delete notification
 */
export function deleteNotification(notificationId: string): void {
  const notifications = getAllNotifications().filter((n) => n.id !== notificationId);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

/**
 * Generate notifications for a project
 */
export function generateProjectNotifications(project: WorkspaceProject): void {
  const config = getRemindersConfig();
  const now = new Date();
  const existingNotifications = getProjectNotifications(project.id);

  // Follow-up reminder
  if (config.followUpAfterDays > 0) {
    const draftQuotes = project.quotes.filter((q) => q.status === "draft");
    draftQuotes.forEach((quote) => {
      const daysSinceCreation = Math.floor(
        (now.getTime() - new Date(quote.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreation >= config.followUpAfterDays) {
        // Check if we already have a notification for this
        const exists = existingNotifications.some(
          (n) => n.type === "follow_up" && n.message.includes(quote.id)
        );

        if (!exists) {
          createNotification(
            project.id,
            "follow_up",
            "Follow up needed",
            `Quote "${quote.title}" has been pending for ${daysSinceCreation} days. Send a follow-up to the client.`,
            "high",
            `/workspace/${project.id}?tab=quotes`
          );
        }
      }
    });
  }

  // Overdue task reminder
  if (config.overdueTaskReminder) {
    const overdueTasks = project.tasks.filter((t) => {
      if (t.status === "completed" || !t.dueDate) return false;
      return new Date(t.dueDate) < now;
    });

    overdueTasks.forEach((task) => {
      const exists = existingNotifications.some(
        (n) => n.type === "overdue_task" && n.message.includes(task.id)
      );

      if (!exists) {
        createNotification(
          project.id,
          "overdue_task",
          "⚠️ Overdue task",
          `Task "${task.title}" is overdue. Update its status or reschedule.`,
          "high",
          `/workspace/${project.id}?tab=tasks`
        );
      }
    });
  }

  // Unfinished quote reminder
  if (config.unfinishedQuoteReminder) {
    const unfinishedQuotes = project.quotes.filter(
      (q) => q.status === "draft" || q.status === "sent"
    );

    if (unfinishedQuotes.length > 0 && project.tasks.length === 0) {
      const exists = existingNotifications.some(
        (n) => n.type === "unfinished_quote"
      );

      if (!exists) {
        createNotification(
          project.id,
          "unfinished_quote",
          "Unfinished quote",
          `You have ${unfinishedQuotes.length} quote(s) without corresponding tasks. Create tasks to track progress.`,
          "medium",
          `/workspace/${project.id}?tab=tasks`
        );
      }
    }
  }
}

/**
 * Get icon for notification type
 */
function getIconForType(type: Notification["type"]): string {
  const icons: Record<Notification["type"], string> = {
    follow_up: "💬",
    overdue_task: "⚠️",
    unfinished_quote: "📋",
    status_change: "✨",
    reminder: "🔔",
  };
  return icons[type] || "🔔";
}

/**
 * Clear old notifications (older than 30 days)
 */
export function clearOldNotifications(): void {
  const notifications = getAllNotifications();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  const filtered = notifications.filter(
    (n) => new Date(n.createdAt) > cutoffDate || !n.isRead
  );

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
}

/**
 * Get notification summary for daily digest
 */
export function getNotificationDigest(): {
  unreadCount: number;
  byType: Record<string, number>;
  priority: Record<string, number>;
} {
  const unread = getUnreadNotifications();

  const byType: Record<string, number> = {};
  const priority: Record<string, number> = {};

  unread.forEach((n) => {
    byType[n.type] = (byType[n.type] || 0) + 1;
    priority[n.priority] = (priority[n.priority] || 0) + 1;
  });

  return {
    unreadCount: unread.length,
    byType,
    priority,
  };
}
