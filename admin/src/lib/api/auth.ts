import { apiClient } from './client';
import type { User, LoginResponse } from './types';
import type { Menu } from './menus';

export interface LoginDto {
  username: string;
  password: string;
}

export const authApi = {
  login: async (data: LoginDto): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/auth/profile');
  },

  getPermissions: async (): Promise<string[]> => {
    return apiClient.get<string[]>('/auth/permissions');
  },

  getMenus: async (): Promise<Menu[]> => {
    return apiClient.get<Menu[]>('/auth/menus');
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },
};

