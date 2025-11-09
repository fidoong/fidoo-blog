import { apiClient } from './client';
import type { User, PaginatedResponse, UserQueryParams } from './types';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role?: 'admin' | 'editor' | 'user';
}

export interface UpdateUserDto {
  nickname?: string;
  email?: string;
  bio?: string;
  avatar?: string;
  role?: 'admin' | 'editor' | 'user';
  status?: 'active' | 'inactive' | 'banned';
}

export const usersApi = {
  // 获取用户列表（支持增强查询条件）
  getUsers: async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>('/users', { params });
  },

  // 获取用户详情
  getUser: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // 创建用户
  createUser: async (data: CreateUserDto): Promise<User> => {
    return apiClient.post<User>('/users', data);
  },

  // 更新用户
  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    return apiClient.post<User>(`/users/${id}/update`, data);
  },

  // 删除用户
  deleteUser: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/users/${id}/delete`);
  },
};

