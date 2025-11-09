import { apiClient } from './client';
import type { User, PaginatedResponse } from './types';

export interface FollowCheckResponse {
  isFollowing: boolean;
}

export const followsApi = {
  // 关注用户
  follow: async (
    userId: string,
  ): Promise<{ message: string; isFollowing: boolean }> => {
    return apiClient.post<{ message: string; isFollowing: boolean }>(`/follows/${userId}`);
  },

  // 取消关注
  unfollow: async (
    userId: string,
  ): Promise<{ message: string; isFollowing: boolean }> => {
    return apiClient.post<{ message: string; isFollowing: boolean }>(`/follows/${userId}/unfollow`);
  },

  // 检查是否已关注
  checkFollowing: async (userId: string): Promise<FollowCheckResponse> => {
    return apiClient.get<FollowCheckResponse>(`/follows/check/${userId}`);
  },

  // 获取关注列表
  getFollowings: async (
    userId: string,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>(`/follows/following/${userId}`, {
      params: { page, pageSize },
    });
  },

  // 获取粉丝列表
  getFollowers: async (
    userId: string,
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>(`/follows/followers/${userId}`, {
      params: { page, pageSize },
    });
  },
};
