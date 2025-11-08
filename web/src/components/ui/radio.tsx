'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, id, name, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        <label
          htmlFor={radioId}
          className={cn(
            'flex items-center gap-2 cursor-pointer group',
            props.disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <div className="relative">
            <input
              type="radio"
              id={radioId}
              name={name}
              className="sr-only peer"
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                'w-4 h-4 border-2 rounded-full transition-all duration-200',
                'peer-checked:border-primary-600',
                'peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-1',
                'group-hover:border-primary-400',
                error
                  ? 'border-red-300 peer-checked:border-red-600'
                  : 'border-gray-300',
                'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 rounded-full scale-0 transition-transform duration-200',
                  'peer-checked:scale-[0.5]',
                  error ? 'bg-red-600' : 'bg-primary-600',
                )}
              />
            </div>
          </div>
          <span className="text-sm text-gray-700 select-none">{label}</span>
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
Radio.displayName = 'Radio';

export { Radio };

