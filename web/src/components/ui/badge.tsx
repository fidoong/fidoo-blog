'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        success: 'bg-green-50 text-green-600 hover:bg-green-100',
        warning: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100',
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50',
      },
      size: {
        default: 'px-3 py-1 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };

