'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 border rounded-lg resize-none',
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 animate-in fade-in duration-200">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };

