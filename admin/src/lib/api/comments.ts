import { apiClient } from './client';
import type { Comment, PaginatedResponse, CommentQueryParams } from './types';

export const commentsApi = {
  // 获取评论列表（支持增强查询条件）
  getComments: async (
    params?: CommentQueryParams,
  ): Promise<PaginatedResponse<Comment>> => {
    return apiClient.get<PaginatedResponse<Comment>>('/comments', { params });
  },

  // 获取文章的评论
  getCommentsByPost: async (
    postId: string,
    status?: 'pending' | 'approved' | 'rejected',
  ): Promise<Comment[]> => {
    return apiClient.get<Comment[]>(`/comments/post/${postId}`, {
      params: status ? { status } : undefined,
    });
  },

  // 获取评论详情
  getComment: async (id: string): Promise<Comment> => {
    return apiClient.get<Comment>(`/comments/${id}`);
  },

  // 通过评论
  approveComment: async (id: string): Promise<Comment> => {
    return apiClient.post<Comment>(`/comments/${id}/approve`);
  },

  // 拒绝评论
  rejectComment: async (id: string): Promise<Comment> => {
    return apiClient.post<Comment>(`/comments/${id}/reject`);
  },

  // 删除评论
  deleteComment: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/comments/${id}/delete`);
  },
};

