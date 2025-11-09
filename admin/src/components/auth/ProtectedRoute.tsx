'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useUserPermissions } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** 需要的权限代码数组（用户需要拥有其中任意一个权限） */
  requiredPermissions?: string[];
}

export function ProtectedRoute({ children, requiredPermissions }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const { data: permissions, isLoading: isLoadingPermissions } = useUserPermissions();

  // 检查权限
  const hasPermission = (() => {
    // 如果权限数据还在加载，返回 undefined（表示未知）
    if (isLoadingPermissions || !permissions) {
      return undefined;
    }

    // 确保 permissions 是数组
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }

    // 如果不需要任何权限，返回 true
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    return requiredPermissions.some((code) => permissions.includes(code));
  })();

  // 等待状态恢复完成
  useEffect(() => {
    if (hasHydrated) {
      setIsChecking(false);
    }
  }, [hasHydrated]);

  useEffect(() => {
    // 如果还在检查状态，不执行任何操作
    if (isChecking || !hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // 等待权限数据加载完成
    if (isLoadingPermissions || hasPermission === undefined) {
      return;
    }

    // 检查权限（只有在权限数据加载完成后才检查）
    if (requiredPermissions && requiredPermissions.length > 0 && hasPermission === false) {
      router.push('/dashboard');
      return;
    }
  }, [
    isAuthenticated,
    requiredPermissions,
    hasPermission,
    isLoadingPermissions,
    router,
    pathname,
    isChecking,
    hasHydrated,
  ]);

  // 如果状态还未恢复或权限数据还在加载，显示加载状态
  if (isChecking || !hasHydrated || isLoadingPermissions || hasPermission === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // 检查权限（只有在权限数据加载完成后才检查）
  if (requiredPermissions && requiredPermissions.length > 0 && hasPermission === false) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">访问被拒绝</h2>
          <p className="mt-4 text-muted-foreground">您没有访问此页面的权限</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-primary hover:underline"
          >
            返回仪表盘
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
