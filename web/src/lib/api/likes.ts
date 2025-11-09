import { apiClient } from './client';

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
  like: async (targetType: LikeType, targetId: string): Promise<LikeResponse> => {
    return apiClient.post<LikeResponse>('/likes', {
      targetType,
      targetId,
    });
  },

  // 取消点赞
  unlike: async (targetType: LikeType, targetId: string): Promise<LikeResponse> => {
    return apiClient.post<LikeResponse>('/likes/unlike', {
      targetType,
      targetId,
    });
  },

  // 检查是否已点赞
  checkLike: async (
    targetType: LikeType,
    targetId: string,
  ): Promise<LikeCheckResponse> => {
    return apiClient.get<LikeCheckResponse>('/likes/check', {
      params: { targetType, targetId },
    });
  },

  // 获取我的点赞列表
  getMyLikes: async (
    targetType: LikeType,
    page?: number,
    pageSize?: number,
  ): Promise<any> => {
    return apiClient.get<any>('/likes/my', {
      params: { targetType, page, pageSize },
    });
  },
};
