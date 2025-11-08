import { apiClient } from './client';
import type { ApiResponse, Comment, CreateCommentDto, CommentStatus } from './types';

export const commentsApi = {
  // 获取文章评论
  getPostComments: async (
    postId: string,
    status?: CommentStatus,
  ): Promise<ApiResponse<Comment[]>> => {
    const response = await apiClient.get(`/comments/post/${postId}`, {
      params: status ? { status } : {},
    });
    return response.data;
  },

  // 创建评论
  createComment: async (data: CreateCommentDto): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.post('/comments', data);
    return response.data;
  },

  // 获取评论详情
  getComment: async (id: string): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.get(`/comments/${id}`);
    return response.data;
  },

  // 更新评论
  updateComment: async (id: string, content: string): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.post(`/comments/${id}/update`, { content });
    return response.data;
  },

  // 删除评论
  deleteComment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/comments/${id}/delete`);
    return response.data;
  },
};
