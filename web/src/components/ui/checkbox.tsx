'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        <label
          htmlFor={checkboxId}
          className={cn(
            'flex items-center gap-2 cursor-pointer group',
            props.disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <div className="relative">
            <input
              type="checkbox"
              id={checkboxId}
              className="sr-only peer"
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                'w-4 h-4 border-2 rounded transition-all duration-200',
                'peer-checked:bg-primary-600 peer-checked:border-primary-600',
                'peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-1',
                'group-hover:border-primary-400',
                error
                  ? 'border-red-300 peer-checked:bg-red-600 peer-checked:border-red-600'
                  : 'border-gray-300',
                'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              )}
            >
              <svg
                className="w-full h-full text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          {label && (
            <span className="text-sm text-gray-700 select-none">{label}</span>
          )}
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-600 animate-in fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };

