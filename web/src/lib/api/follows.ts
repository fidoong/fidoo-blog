import { apiClient } from './client';
import type { ApiResponse, User, PaginatedResponse } from './types';

export interface FollowCheckResponse {
  isFollowing: boolean;
}

export const followsApi = {
  // 关注用户
  follow: async (
    userId: string,
  ): Promise<ApiResponse<{ message: string; isFollowing: boolean }>> => {
    const response = await apiClient.post(`/follows/${userId}`);
    return response.data;
  },

  // 取消关注
  unfollow: async (
    userId: string,
  ): Promise<ApiResponse<{ message: string; isFollowing: boolean }>> => {
    const response = await apiClient.post(`/follows/${userId}/unfollow`);
    return response.data;
  },

  // 检查是否已关注
  checkFollowing: async (userId: string): Promise<ApiResponse<FollowCheckResponse>> => {
    const response = await apiClient.get(`/follows/check/${userId}`);
    return response.data;
  },

  // 获取关注列表
  getFollowings: async (
    userId: string,
    page?: number,
    pageSize?: number,
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get(`/follows/following/${userId}`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  // 获取粉丝列表
  getFollowers: async (
    userId: string,
    page?: number,
    pageSize?: number,
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const response = await apiClient.get(`/follows/followers/${userId}`, {
      params: { page, pageSize },
    });
    return response.data;
  },
};
