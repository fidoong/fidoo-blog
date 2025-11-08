'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

// FadeIn 动画组件
export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export function FadeIn({
  delay = 0,
  duration = 500,
  className,
  children,
  ...props
}: FadeInProps) {
  return (
    <div
      className={cn('animate-in fade-in', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// SlideIn 动画组件
export interface SlideInProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export function SlideIn({
  direction = 'up',
  delay = 0,
  duration = 500,
  className,
  children,
  ...props
}: SlideInProps) {
  const directionClasses = {
    up: 'slide-in-up',
    down: 'slide-in-down',
    left: 'slide-in-left',
    right: 'slide-in-right',
  };

  return (
    <div
      className={cn(directionClasses[direction], className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Scale 动画组件
export interface ScaleProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export function Scale({
  delay = 0,
  duration = 200,
  className,
  children,
  ...props
}: ScaleProps) {
  return (
    <div
      className={cn('zoom-in-95', className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Stagger 容器 - 为子元素添加延迟动画
export interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  staggerDelay?: number;
  children: React.ReactNode;
}

export function Stagger({
  staggerDelay = 50,
  className,
  children,
  ...props
}: StaggerProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className} {...props}>
      {childrenArray.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            style: {
              ...child.props.style,
              animationDelay: `${index * staggerDelay}ms`,
            },
          } as React.HTMLAttributes<HTMLElement>);
        }
        return child;
      })}
    </div>
  );
}

