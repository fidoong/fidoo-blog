'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface PostFormSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PostFormSection({
  title,
  icon,
  children,
  className,
}: PostFormSectionProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-6 space-y-4',
        'transition-shadow duration-200 hover:shadow-sm',
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {icon && <span className="text-primary-600">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

