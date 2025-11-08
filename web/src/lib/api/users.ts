import { apiClient } from './client';
import type { ApiResponse, User, PaginatedResponse } from './types';

export const usersApi = {
  // 获取用户详情
  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // 获取用户列表（管理员）
  getUsers: async (
    page?: number,
    pageSize?: number,
    keyword?: string,
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get('/users', {
      params: { page, pageSize, keyword },
    });
    return response.data;
  },
};
