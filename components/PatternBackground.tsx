'use client';

import React from 'react';

interface BackgroundProps {
  pattern?: 'dots' | 'grid' | 'gradient' | 'waves' | 'none';
  children?: React.ReactNode;
  className?: string;
}

export function PatternBackground({
  pattern = 'gradient',
  children,
  className = '',
}: BackgroundProps) {
  const patterns = {
    dots: `
      radial-gradient(circle, #000 1px, transparent 1px)
      background-size: 20px 20px
    `,
    grid: `
      linear-gradient(#e0e0e0 1px, transparent 1px),
      linear-gradient(90deg, #e0e0e0 1px, transparent 1px)
      background-size: 20px 20px
    `,
    gradient: `
      linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    `,
    waves: `
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z' fill='%23f3f4f6' /%3E%3C/svg%3E")
      background-size: 100% auto
      background-position: 0 bottom
    `,
    none: 'transparent',
  };

  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        background: pattern === 'waves' ? '#e0e7ff' : undefined,
        backgroundImage: pattern !== 'none' && pattern !== 'gradient' ? patterns[pattern] : undefined,
        backgroundGradient: pattern === 'gradient' ? patterns[pattern] : undefined,
      }}
    >
      {/* Gradient overlay for better readability */}
      {pattern !== 'none' && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
