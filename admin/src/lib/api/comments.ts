import { apiClient } from './client';
import type { Comment, PaginatedResponse, CommentQueryParams } from './types';

export const commentsApi = {
  getComments: async (
    params?: CommentQueryParams,
  ): Promise<PaginatedResponse<Comment>> => {
    return apiClient.get<PaginatedResponse<Comment>>('/comments', { params });
  },

  getComment: async (id: string): Promise<Comment> => {
    return apiClient.get<Comment>(`/comments/${id}`);
  },

  approveComment: async (id: string): Promise<Comment> => {
    return apiClient.post<Comment>(`/comments/${id}/approve`);
  },

  rejectComment: async (id: string): Promise<Comment> => {
    return apiClient.post<Comment>(`/comments/${id}/reject`);
  },

  deleteComment: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/comments/${id}/delete`);
  },
};

