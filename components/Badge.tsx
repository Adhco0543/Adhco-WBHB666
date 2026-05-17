'use client';

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function Badge({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-full font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {label}
    </span>
  );
}

// Status badge for invoice/project status
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'overdue' | 'draft';
  size?: BadgeSize;
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    active: { label: 'Active', variant: 'success' as BadgeVariant },
    inactive: { label: 'Inactive', variant: 'neutral' as BadgeVariant },
    pending: { label: 'Pending', variant: 'info' as BadgeVariant },
    completed: { label: 'Completed', variant: 'success' as BadgeVariant },
    overdue: { label: 'Overdue', variant: 'danger' as BadgeVariant },
    draft: { label: 'Draft', variant: 'neutral' as BadgeVariant },
  };

  const config = statusConfig[status];
  const dotColor = {
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
  }[config.variant];

  return (
    <Badge
      label={config.label}
      variant={config.variant}
      size={size}
      icon={<span className={`w-2 h-2 rounded-full ${dotColor}`} />}
    />
  );
}
