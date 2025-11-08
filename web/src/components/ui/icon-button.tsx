'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-all duration-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
  'active:scale-95',
  {
    variants: {
      variant: {
        default: 'text-gray-700 hover:bg-gray-100 hover:text-primary-600',
        primary: 'text-white bg-primary-600 hover:bg-primary-700',
        ghost: 'hover:bg-gray-100',
        danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export type IconButtonVariant = 'default' | 'primary' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'variant' | 'size'> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  'aria-label': string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };

