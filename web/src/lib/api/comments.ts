import { apiClient } from './client';
import type { Comment, CreateCommentDto, CommentStatus } from './types';

export const commentsApi = {
  // 获取文章评论
  getPostComments: async (
    postId: string,
    status?: CommentStatus,
  ): Promise<Comment[]> => {
    return apiClient.get<Comment[]>(`/comments/post/${postId}`, {
      params: status ? { status } : {},
    });
  },

  // 创建评论
  createComment: async (data: CreateCommentDto): Promise<Comment> => {
    return apiClient.post<Comment>('/comments', data);
  },

  // 获取评论详情
  getComment: async (id: string): Promise<Comment> => {
    return apiClient.get<Comment>(`/comments/${id}`);
  },

  // 更新评论
  updateComment: async (id: string, content: string): Promise<Comment> => {
    return apiClient.post<Comment>(`/comments/${id}/update`, { content });
  },

  // 删除评论
  deleteComment: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/comments/${id}/delete`);
  },
};
