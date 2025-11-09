import { apiClient } from './client';
import type { Post, PaginatedResponse } from './types';

export interface FavoriteCheckResponse {
  isFavorited: boolean;
}

export const favoritesApi = {
  // 收藏文章
  favorite: async (
    postId: string,
  ): Promise<{ message: string; isFavorited: boolean }> => {
    return apiClient.post<{ message: string; isFavorited: boolean }>(`/favorites/${postId}`);
  },

  // 取消收藏
  unfavorite: async (
    postId: string,
  ): Promise<{ message: string; isFavorited: boolean }> => {
    return apiClient.post<{ message: string; isFavorited: boolean }>(`/favorites/${postId}/unfavorite`);
  },

  // 检查是否已收藏
  checkFavorite: async (postId: string): Promise<FavoriteCheckResponse> => {
    return apiClient.get<FavoriteCheckResponse>(`/favorites/check/${postId}`);
  },

  // 获取我的收藏列表
  getMyFavorites: async (
    page?: number,
    pageSize?: number,
  ): Promise<PaginatedResponse<Post>> => {
    return apiClient.get<PaginatedResponse<Post>>('/favorites/my', {
      params: { page, pageSize },
    });
  },
};
