'use client';

import React, { ReactNode } from 'react';

interface FloatingActionButtonProps {
  icon: ReactNode;
  label?: string;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: 'blue' | 'green' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

const COLORS = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-green-600 hover:bg-green-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  red: 'bg-red-600 hover:bg-red-700',
};

const POSITIONS = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

const SIZES = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-14 h-14 text-xl',
  lg: 'w-16 h-16 text-2xl',
};

export function FloatingActionButton({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  color = 'blue',
  size = 'md',
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        fixed ${POSITIONS[position]} ${SIZES[size]} ${COLORS[color]}
        rounded-full shadow-lg hover:shadow-xl transition-all duration-300
        flex items-center justify-center text-white z-40
        hover:scale-110 active:scale-95
      `}
    >
      {icon}
    </button>
  );
}
