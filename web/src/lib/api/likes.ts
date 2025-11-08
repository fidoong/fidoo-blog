import { apiClient } from './client';
import type { ApiResponse } from './types';

export type LikeType = 'post' | 'comment';

export interface LikeCheckResponse {
  isLiked: boolean;
}

export interface LikeResponse {
  message: string;
  isLiked: boolean;
}

export const likesApi = {
  // 点赞
  like: async (targetType: LikeType, targetId: string): Promise<ApiResponse<LikeResponse>> => {
    const response = await apiClient.post('/likes', {
      targetType,
      targetId,
    });
    return response.data;
  },

  // 取消点赞
  unlike: async (targetType: LikeType, targetId: string): Promise<ApiResponse<LikeResponse>> => {
    const response = await apiClient.post('/likes/unlike', {
      targetType,
      targetId,
    });
    return response.data;
  },

  // 检查是否已点赞
  checkLike: async (
    targetType: LikeType,
    targetId: string,
  ): Promise<ApiResponse<LikeCheckResponse>> => {
    const response = await apiClient.get('/likes/check', {
      params: { targetType, targetId },
    });
    return response.data;
  },

  // 获取我的点赞列表
  getMyLikes: async (
    targetType: LikeType,
    page?: number,
    pageSize?: number,
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/likes/my', {
      params: { targetType, page, pageSize },
    });
    return response.data;
  },
};
