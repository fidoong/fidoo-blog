import { apiClient } from './client';
import type { ApiResponse, Post, PaginatedResponse } from './types';

export interface FavoriteCheckResponse {
  isFavorited: boolean;
}

export const favoritesApi = {
  // 收藏文章
  favorite: async (
    postId: string,
  ): Promise<ApiResponse<{ message: string; isFavorited: boolean }>> => {
    const response = await apiClient.post(`/favorites/${postId}`);
    return response.data;
  },

  // 取消收藏
  unfavorite: async (
    postId: string,
  ): Promise<ApiResponse<{ message: string; isFavorited: boolean }>> => {
    const response = await apiClient.post(`/favorites/${postId}/unfavorite`);
    return response.data;
  },

  // 检查是否已收藏
  checkFavorite: async (postId: string): Promise<ApiResponse<FavoriteCheckResponse>> => {
    const response = await apiClient.get(`/favorites/check/${postId}`);
    return response.data;
  },

  // 获取我的收藏列表
  getMyFavorites: async (
    page?: number,
    pageSize?: number,
  ): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const response = await apiClient.get('/favorites/my', {
      params: { page, pageSize },
    });
    return response.data;
  },
};
