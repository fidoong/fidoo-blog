'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className,
  showImage = true,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse',
        className,
      )}
    >
      {showImage && <div className="w-full h-48 bg-gray-200 shimmer" />}
      <div className="p-6">
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-16 bg-gray-200 rounded shimmer" />
          <div className="h-6 w-16 bg-gray-200 rounded shimmer" />
        </div>
        <div className="h-6 bg-gray-200 rounded mb-2 shimmer" />
        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4 shimmer" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-gray-200 rounded mb-2 shimmer',
              i === lines - 1 && 'w-5/6',
            )}
          />
        ))}
      </div>
    </div>
  );
}

