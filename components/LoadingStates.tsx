'use client';

import React from 'react';

// Skeleton loader for cards
export function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg bg-gray-200 animate-pulse">
      <div className="h-4 bg-gray-300 rounded mb-3"></div>
      <div className="h-8 bg-gray-300 rounded mb-4"></div>
      <div className="h-3 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
    </div>
  );
}

// Skeleton for table rows
export function SkeletonTableRow() {
  return (
    <tr>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
    </tr>
  );
}

// Skeleton for lists
export function SkeletonList() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 animate-pulse">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton grid
export function SkeletonGrid({ columns = 3 }: { columns?: number }) {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {[...Array(columns)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Progress loader with percentage
export function ProgressLoader({ progress = 0, label = 'Loading...' }: { progress?: number; label?: string }) {
  return (
    <div className="w-full p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-xs mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

// Pulse animation for interactive elements
export function PulseLoader() {
  return (
    <div className="flex items-center justify-center gap-1">
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-100"></div>
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
    </div>
  );
}

// Page loading overlay
export function PageLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'fixed inset-0 bg-white/80' : 'w-full h-64'
      }`}
    >
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <PulseLoader />
        </div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

// Skeleton dashboard grid
export function SkeletonDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div className="h-12 bg-gray-200 rounded animate-pulse w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
