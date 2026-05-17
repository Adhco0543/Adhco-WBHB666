'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotificationStore, NotificationType } from '@/lib/hooks/useNotifications';

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-600" />;
  }
}

function getNotificationColor(type: NotificationType) {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
  }
}

function getTextColor(type: NotificationType) {
  switch (type) {
    case 'success':
      return 'text-green-900';
    case 'error':
      return 'text-red-900';
    case 'warning':
      return 'text-yellow-900';
    case 'info':
      return 'text-blue-900';
  }
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: any;
  onClose: () => void;
}) {
  return (
    <div
      className={`${getNotificationColor(
        notification.type
      )} border rounded-lg p-4 shadow-lg flex items-start gap-3 animate-in slide-in-from-right`}
    >
      {getNotificationIcon(notification.type)}
      <div className="flex-1">
        <p className={`font-semibold ${getTextColor(notification.type)}`}>
          {notification.title}
        </p>
        {notification.message && (
          <p className={`text-sm ${getTextColor(notification.type)} mt-1`}>
            {notification.message}
          </p>
        )}
        {notification.action && (
          <button
            onClick={() => {
              notification.action.onClick();
              onClose();
            }}
            className={`text-sm font-medium mt-2 underline ${getTextColor(
              notification.type
            )} hover:opacity-75 transition`}
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${getTextColor(notification.type)} hover:opacity-75`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-3">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
