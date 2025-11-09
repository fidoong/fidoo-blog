/**
 * 用户管理 API
 */

import { apiClient } from './client';
import type { PaginatedResponse } from './types';

export interface User {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  status?: string;
}

export interface QueryUserDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
}

export const usersApi = {
  // 获取用户列表
  getUsers: async (params?: QueryUserDto): Promise<PaginatedResponse<User>> => {
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
    return apiClient.put<User>(`/users/${id}`, data);
  },

  // 删除用户
  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${id}`);
  },
};
