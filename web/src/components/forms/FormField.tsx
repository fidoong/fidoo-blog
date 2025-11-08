'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  helperText,
  required,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
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
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  register?: UseFormRegisterReturn;
}

export function FormInput({
  label = '',
  error,
  helperText,
  register,
  ...props
}: FormInputProps) {
  return (
    <FormField label={label} error={error} helperText={helperText} required={props.required}>
      <Input
        {...register}
        {...props}
        error={error}
        helperText={helperText}
      />
    </FormField>
  );
}

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  register?: UseFormRegisterReturn;
}

export function FormTextarea({
  label,
  error,
  helperText,
  register,
  ...props
}: FormTextareaProps) {
  return (
    <FormField label={label} error={error} helperText={helperText} required={props.required}>
      <Textarea
        {...register}
        {...props}
        error={error}
        helperText={helperText}
      />
    </FormField>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  register?: UseFormRegisterReturn;
}

export function FormSelect({
  label,
  error,
  helperText,
  options,
  register,
  ...props
}: FormSelectProps) {
  return (
    <FormField label={label} error={error} helperText={helperText} required={props.required}>
      <Select
        {...register}
        {...props}
        error={error}
        helperText={helperText}
        options={options}
      />
    </FormField>
  );
}

