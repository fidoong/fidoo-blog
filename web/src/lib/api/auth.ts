import { apiClient } from './client';
import type { ApiResponse, User, LoginResponse } from './types';

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
  register: async (data: RegisterDto): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // 用户登录
  login: async (data: LoginDto): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // 刷新 token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // 获取当前用户信息
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // 登出
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};
