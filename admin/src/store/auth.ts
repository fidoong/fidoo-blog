import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/lib/api/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  hasRole: (role: 'admin' | 'editor' | 'user') => boolean;
  hasAnyRole: (roles: ('admin' | 'editor' | 'user')[]) => boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
        // 同时保存到 localStorage（用于 API 客户端）
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
      },

      setUser: (user) => {
        set({ user });
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
        }
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        return user.role === role;
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // hasHydrated 不应该被持久化
      }),
      onRehydrateStorage: () => (state) => {
        // 状态恢复后，同步 localStorage 中的 token
        if (state && typeof window !== 'undefined') {
          if (state.accessToken) {
            localStorage.setItem('accessToken', state.accessToken);
          }
          if (state.refreshToken) {
            localStorage.setItem('refreshToken', state.refreshToken);
          }
          // 标记状态已恢复
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

