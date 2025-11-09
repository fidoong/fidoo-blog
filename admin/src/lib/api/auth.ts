import { apiClient } from './client';
import type { ApiResponse, User, LoginResponse } from './types';

export interface LoginDto {
  username: string;
  password: string;
}

export const authApi = {
  login: async (data: LoginDto): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  getPermissions: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get('/auth/permissions');
    return response.data;
  },

  getMenus: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/auth/menus');
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

