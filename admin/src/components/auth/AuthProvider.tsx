/**
 * 认证提供者组件
 * 用于在应用启动时初始化认证状态
 */

'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, user, setPermissions, setMenus, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // 等待 zustand persist 完成 hydration
    if (!_hasHydrated) {
      return;
    }

    // 如果有 token 但没有用户信息，尝试恢复用户状态
    if (accessToken && !user) {
      const restoreAuth = async () => {
        try {
          const [profile, permissions, menus] = await Promise.all([
            authApi.getProfile(),
            authApi.getPermissions(),
            authApi.getMenus(),
          ]);

          useAuthStore.setState({
            user: profile,
            permissions,
            menus,
          });

          setPermissions(permissions);
          setMenus(menus);
        } catch (error) {
          // 静默处理错误，不显示错误提示（避免在页面加载时弹出错误）
          console.error('恢复认证状态失败:', error);
          // Token 可能已过期，清除认证信息
          useAuthStore.getState().clearAuth();
        }
      };

      restoreAuth();
    }
  }, [_hasHydrated, accessToken, user, setPermissions, setMenus]);

  return <>{children}</>;
}
