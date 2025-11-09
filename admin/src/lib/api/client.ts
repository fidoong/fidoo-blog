/**
 * Admin 端 API 客户端实例
 * 使用统一的 @fidoo-blog/shared API 客户端
 */

import { ApiClient } from '@fidoo-blog/shared/api';
import { useAuthStore } from '@/store/auth';

// 创建 API 客户端实例
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1',
  timeout: 30000,
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },
  refreshToken: async (refreshToken: string) => {
    // 使用默认的刷新逻辑，但需要导入 apiClient，这里会有循环依赖
    // 所以使用 axios 直接调用
    const axios = (await import('axios')).default;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1';
    const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });

    if (response.data.code === 0 && response.data.data) {
      return {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
    }

    throw new Error(response.data.message || 'Token 刷新失败');
  },
  updateAuth: (accessToken: string, refreshToken?: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    // 同步更新 zustand store
    const store = useAuthStore.getState();
    if (store.setAccessToken) {
      store.setAccessToken(accessToken);
    } else if (store.user) {
      store.setAuth(store.user, accessToken, refreshToken || store.refreshToken || '');
    }
  },
  clearAuth: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // 同步清除 zustand store
    const store = useAuthStore.getState();
    store.clearAuth();
  },
  redirectToLogin: () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  },
  enableLogging: typeof window !== 'undefined' && process.env.NODE_ENV === 'development',
});
