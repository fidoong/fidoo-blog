import { apiClient } from './client';
import type { User, PaginatedResponse } from './types';

export const usersApi = {
  // 获取用户详情
  getUser: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // 获取用户列表（管理员）
  getUsers: async (
    page?: number,
    pageSize?: number,
    keyword?: string,
  ): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>('/users', {
      params: { page, pageSize, keyword },
    });
  },
};
