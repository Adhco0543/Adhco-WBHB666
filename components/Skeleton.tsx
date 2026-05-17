'use client';

import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  count?: number;
  variant?: 'text' | 'card' | 'circle';
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'text',
}: SkeletonProps) {
  const baseClass = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse';

  const variantClass = {
    text: 'rounded',
    card: 'rounded-lg',
    circle: 'rounded-full',
  }[variant];

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
      <Skeleton height="2rem" className="w-3/4" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" className="w-5/6" />
      <div className="flex gap-2 pt-4">
        <Skeleton height="2.5rem" className="flex-1" variant="card" />
        <Skeleton height="2.5rem" className="flex-1" variant="card" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
