'use client';

import React from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  default:
    'bg-white dark:bg-gray-900 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-800',
  elevated:
    'bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-800',
  outlined:
    'bg-transparent border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
  filled:
    'bg-gray-100 dark:bg-gray-800 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700',
};

export function Card({
  children,
  variant = 'default',
  className = '',
  hover = false,
  interactive = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg transition-all
        ${variantStyles[variant]}
        ${hover ? 'hover:shadow-lg' : ''}
        ${interactive ? 'cursor-pointer active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Header section for cards
interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  actions,
  icon,
  className = '',
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800 ${className}`}>
      <div className="flex-1 flex gap-4">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}

// Body section for cards
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

// Footer section for cards
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`flex items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
}

// Stat card for displaying metrics
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

const colorStyles = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  purple:
    'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

export function StatCard({
  label,
  value,
  icon,
  color = 'blue',
  trend,
  className = '',
}: StatCardProps) {
  return (
    <Card variant="outlined" className={className}>
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {value}
            </p>
            {trend && (
              <p
                className={`text-xs font-medium mt-2 ${
                  trend.direction === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
              </p>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// Image card for displaying images with content
interface ImageCardProps {
  image: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ImageCard({
  image,
  title,
  description,
  actions,
  onClick,
  className = '',
}: ImageCardProps) {
  return (
    <Card
      variant="elevated"
      interactive
      onClick={onClick}
      className={className}
    >
      <div className="overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardBody>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </p>
        )}
      </CardBody>
      {actions && <CardFooter>{actions}</CardFooter>}
    </Card>
  );
}
