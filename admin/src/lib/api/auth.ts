/**
 * 认证相关 API
 */

import { apiClient } from './client';
import type { User } from '@/store/auth';

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export const authApi = {
  // 用户登录
  login: async (data: LoginDto): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  // 用户注册
  register: async (data: RegisterDto): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/register', data);
  },

  // 获取当前用户信息
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/auth/profile');
  },

  // 获取用户权限列表
  getPermissions: async (): Promise<string[]> => {
    return apiClient.get<string[]>('/auth/permissions');
  },

  // 获取用户菜单列表
  getMenus: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/auth/menus');
  },

  // 登出
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },
};
