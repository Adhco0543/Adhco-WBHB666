'use client';

import React from 'react';

type ProgressColor = 'blue' | 'green' | 'orange' | 'red' | 'purple';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  size?: ProgressSize;
  animated?: boolean;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

const colorStyles = {
  blue: 'bg-blue-600 dark:bg-blue-500',
  green: 'bg-green-600 dark:bg-green-500',
  orange: 'bg-orange-600 dark:bg-orange-500',
  red: 'bg-red-600 dark:bg-red-500',
  purple: 'bg-purple-600 dark:bg-purple-500',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function Progress({
  value,
  max = 100,
  color = 'blue',
  size = 'md',
  animated = true,
  label,
  showPercent = true,
  className = '',
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {/* Label and percentage */}
      {label && (
        <div className="flex justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </p>
          {showPercent && (
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(percentage)}%
            </p>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={`
          w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden
          ${sizeStyles[size]}
        `}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${colorStyles[color]}
            ${animated ? 'shadow-lg' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Circular progress indicator
interface CircularProgressProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  color = 'blue',
  size = 100,
  strokeWidth = 8,
  animated = true,
  showLabel = true,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    blue: '#2563eb',
    green: '#16a34a',
    orange: '#ea580c',
    red: '#dc2626',
    purple: '#9333ea',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorMap[color]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: animated ? 'stroke-dashoffset 0.6s ease-out' : 'none',
            }}
          />
        </svg>

        {/* Center text */}
        {showLabel && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Multi-step progress indicator
interface Step {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StepsProgressProps {
  steps: Step[];
  className?: string;
}

export function StepsProgress({ steps, className = '' }: StepsProgressProps) {
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const currentIndex = steps.findIndex((s) => s.status === 'current');

  return (
    <div className={className}>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {completedCount + (currentIndex >= 0 ? 1 : 0)}/{steps.length}
          </p>
        </div>
        <Progress
          value={completedCount + (currentIndex >= 0 ? 1 : 0)}
          max={steps.length}
          color="blue"
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm
                ${
                  step.status === 'completed'
                    ? 'bg-green-600 text-white'
                    : step.status === 'current'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}
            >
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            <p
              className={`
                font-medium
                ${
                  step.status === 'current'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-400'
                }
              `}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
