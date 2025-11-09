/**
 * 权限 Hook
 */

import React from 'react';
import { useAuthStore } from '@/store/auth';

/**
 * 检查是否有指定权限
 */
export function useHasPermission(permission: string): boolean {
  const permissions = useAuthStore((state) => state.permissions);
  return permissions.includes(permission);
}

/**
 * 检查是否有任一权限
 */
export function useHasAnyPermission(permissions: string[]): boolean {
  const userPermissions = useAuthStore((state) => state.permissions);
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * 检查是否有所有权限
 */
export function useHasAllPermissions(permissions: string[]): boolean {
  const userPermissions = useAuthStore((state) => state.permissions);
  return permissions.every((p) => userPermissions.includes(p));
}

/**
 * 权限检查组件 Props
 */
export interface PermissionProps {
  permission?: string;
  permissions?: string[];
  mode?: 'all' | 'any';
  fallback?: React.ReactNode;
  children: React.ReactNode | (() => React.ReactNode);
}

/**
 * 权限控制组件
 */
export function Permission({ permission, permissions, mode = 'any', fallback = null, children }: PermissionProps) {
  const userPermissions = useAuthStore((state) => state.permissions);
  
  let hasPermission = false;

  if (permission) {
    hasPermission = userPermissions.includes(permission);
  } else if (permissions) {
    if (mode === 'all') {
      hasPermission = permissions.every((p) => userPermissions.includes(p));
    } else {
      hasPermission = permissions.some((p) => userPermissions.includes(p));
    }
  }

  if (hasPermission) {
    if (typeof children === 'function') {
      return React.createElement(React.Fragment, null, children());
    }
    return React.createElement(React.Fragment, null, children);
  }
  
  return React.createElement(React.Fragment, null, fallback);
}

