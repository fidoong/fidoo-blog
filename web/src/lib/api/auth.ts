import { apiClient } from './client';
import type { User, LoginResponse } from './types';

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export const authApi = {
  // 用户注册
  register: async (data: RegisterDto): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/register', data);
  },

  // 用户登录
  login: async (data: LoginDto): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  // 刷新 token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  },

  // 获取当前用户信息
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/auth/profile');
  },

  // 登出
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  // GitHub OAuth 授权
  getGithubAuthUrl: (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}/auth/github`;
  },

  // 微信 OAuth 授权
  getWechatAuthUrl: (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}/auth/wechat`;
  },

  // OAuth 回调处理
  handleOAuthCallback: async (
    provider: 'github' | 'wechat',
    code: string,
  ): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>(`/auth/${provider}/callback`, { code });
  },
};
