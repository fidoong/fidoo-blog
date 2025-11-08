'use client';

import * as React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = '', size = 'md', fallback, className, ...props }, ref) => {
    const isSvg = src
      ? src.endsWith('.svg') || src.includes('.svg?') || src.includes('/svg')
      : false;

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-full overflow-hidden flex items-center justify-center',
          'bg-gray-100 border-2 border-gray-200',
          'transition-transform duration-200 hover:scale-105',
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {src ? (
          isSvg ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              loading="lazy"
            />
          )
        ) : (
          fallback || (
            <User className={cn('text-gray-400', iconSizeClasses[size])} />
          )
        )}
      </div>
    );
  },
);
Avatar.displayName = 'Avatar';

export { Avatar };

