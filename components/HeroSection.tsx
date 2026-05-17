'use client';

import React, { ReactNode } from 'react';

interface HeroSectionProps {
  title: string;
  description?: string;
  backgroundImage?: string;
  children?: ReactNode;
  overlay?: boolean;
  height?: 'sm' | 'md' | 'lg' | 'full';
}

export function HeroSection({
  title,
  description,
  backgroundImage,
  children,
  overlay = true,
  height = 'md',
}: HeroSectionProps) {
  const heightClass = {
    sm: 'h-32',
    md: 'h-64',
    lg: 'h-96',
    full: 'h-screen',
  }[height];

  return (
    <div
      className={`relative ${heightClass} bg-cover bg-center bg-no-repeat`}
      style={{
        backgroundImage: backgroundImage
          ? `url('${backgroundImage}')`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center text-center text-white px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          {title}
        </h1>
        {description && (
          <p className="text-xl md:text-2xl max-w-2xl drop-shadow-lg">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
