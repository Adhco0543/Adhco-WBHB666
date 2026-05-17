'use client';

import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <div
      className={`
        backdrop-blur-md bg-white/10 border border-white/20 rounded-xl
        ${hover ? 'hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-2xl' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
