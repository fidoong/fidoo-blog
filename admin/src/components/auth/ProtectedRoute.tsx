/**
 * 路由权限保护组件
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api/auth';
import { Permission } from '@/hooks/usePermissions';
import { useErrorHandler } from '@/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  mode?: 'all' | 'any';
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  permission,
  permissions,
  mode = 'any',
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, accessToken, setPermissions, setMenus, _hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // 等待 zustand persist 完成 hydration
    if (!_hasHydrated) {
      return;
    }

    const checkAuth = async () => {
      // 如果没有 token，跳转到登录页
      if (!accessToken) {
        router.push(redirectTo);
        return;
      }

      // 如果没有用户信息，尝试从 API 获取
      if (!user) {
        try {
          const [profile, permissionsData, menusData] = await Promise.all([
            authApi.getProfile(),
            authApi.getPermissions(),
            authApi.getMenus(),
          ]);

          useAuthStore.setState({
            user: profile,
            permissions: permissionsData,
            menus: menusData,
          });

          setPermissions(permissionsData);
          setMenus(menusData);
        } catch (error) {
          handleError(error, '获取用户信息失败');
          // Token 可能已过期，清除认证信息并跳转登录
          useAuthStore.getState().clearAuth();
          router.push(redirectTo);
          return;
        }
      }

      setInitialized(true);
      setLoading(false);
    };

    if (!initialized) {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, accessToken, user, router, redirectTo, setPermissions, setMenus, initialized]);

  // 等待 hydration 完成
  if (!_hasHydrated || loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // 权限检查
  if (permission || permissions) {
    return (
      <Permission permission={permission} permissions={permissions} mode={mode}>
        {children}
      </Permission>
    );
  }

  return <>{children}</>;
}
