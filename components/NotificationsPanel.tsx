'use client';

import { useState, useEffect } from 'react';
import { WorkspaceProject, ProjectNotification } from '@/lib/workspaceTypes';
import {
  getAllNotifications,
  getUnreadNotifications,
  getProjectNotifications,
  markNotificationAsRead,
  deleteNotification,
} from '@/lib/notifications';

interface NotificationsPanelProps {
  project?: WorkspaceProject;
  showUnreadOnly?: boolean;
  maxNotifications?: number;
  onNotificationClick?: (notification: ProjectNotification) => void;
}

export function NotificationsPanel({
  project,
  showUnreadOnly = true,
  maxNotifications = 10,
  onNotificationClick,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = () => {
      setIsLoading(true);
      try {
        let notifs: ProjectNotification[];

        if (project) {
          notifs = getProjectNotifications(project.id);
        } else {
          notifs = showUnreadOnly ? getUnreadNotifications() : getAllNotifications();
        }

        setNotifications(notifs.slice(0, maxNotifications));
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [project, showUnreadOnly, maxNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow_up':
        return '📞';
      case 'overdue_task':
        return '⏰';
      case 'unfinished_quote':
        return '📋';
      case 'status_change':
        return '🔄';
      case 'reminder':
        return '🔔';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notif: ProjectNotification) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notif);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500 text-sm">
          {showUnreadOnly ? 'All caught up! ✓' : 'No notifications'}
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>🔔</span> Notifications
        </h3>
        {unreadCount > 0 && (
          <span className="text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded-full font-medium">
            {unreadCount} unread
          </span>
        )}
      </div>

      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-3 transition-all hover:shadow-md cursor-pointer ${getNotificationColor(
            notification.priority
          )} ${!notification.isRead ? 'border-current' : ''}`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">{getNotificationIcon(notification.type)}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </div>

              <div className="flex items-center justify-between mt-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium ${getPriorityBadge(notification.priority)}`}>
                  {notification.priority}
                </span>
                <span className="text-gray-500">{formatTime(notification.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {notifications.length >= maxNotifications && (
        <button className="w-full py-2 text-center text-sm text-blue-600 hover:text-blue-700 font-medium rounded hover:bg-blue-50">
          View all notifications
        </button>
      )}
    </div>
  );
}
