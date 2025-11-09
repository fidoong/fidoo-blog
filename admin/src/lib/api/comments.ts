import { apiClient } from './client';
import type { ApiResponse, Comment, PaginatedResponse, CommentQueryParams } from './types';

export const commentsApi = {
  getComments: async (
    params?: CommentQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<Comment>>> => {
    const response = await apiClient.get('/comments', { params });
    return response.data;
  },

  getComment: async (id: string): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.get(`/comments/${id}`);
    return response.data;
  },

  approveComment: async (id: string): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.post(`/comments/${id}/approve`);
    return response.data;
  },

  rejectComment: async (id: string): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.post(`/comments/${id}/reject`);
    return response.data;
  },

  deleteComment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/comments/${id}/delete`);
    return response.data;
  },
};

