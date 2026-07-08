'use client';

import React, { ReactNode } from 'react';
import { FileText, Inbox, FolderOpen, Users, Zap } from 'lucide-react';

interface EmptyStateProps {
  type?: 'invoices' | 'projects' | 'messages' | 'team' | 'default';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
  children?: ReactNode;
}

const ICONS = {
  invoices: <FileText className="w-16 h-16 text-gray-300" />,
  projects: <FolderOpen className="w-16 h-16 text-gray-300" />,
  messages: <Inbox className="w-16 h-16 text-gray-300" />,
  team: <Users className="w-16 h-16 text-gray-300" />,
  default: <Zap className="w-16 h-16 text-gray-300" />,
};

export function EmptyState({
  type = 'default',
  title,
  description,
  action,
  icon,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
      {/* Icon */}
      <div className="mb-4 animate-bounce">
        {icon || ICONS[type]}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-600 text-center max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Children */}
      {children}

      {/* Action */}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
