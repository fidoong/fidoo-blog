import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/api/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      setUser: (user) => {
        set({ user });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: !!state.accessToken && !!state.user, // 基于 token 和 user 判断
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // 恢复时，如果有 token 但没有 user，尝试获取用户信息
        if (state?.accessToken && !state?.user && typeof window !== 'undefined') {
          // 延迟执行，确保 API client 已初始化
          setTimeout(async () => {
            try {
              const { authApi } = await import('@/lib/api/auth');
              const response = await authApi.getProfile();
              if (response.code === 0 && response.data) {
                state.setUser(response.data);
                state.setAuth(response.data, state.accessToken!, state.refreshToken || '');
              }
            } catch (error) {
              // 获取用户信息失败，清除 token
              state.clearAuth();
            }
          }, 100);
        }
      },
    },
  ),
);
