/**
 * 评论管理 API
 */

import { apiClient } from './client';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  likeCount: number;
  ipAddress?: string;
  userId: string;
  postId: string;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content?: string;
  status?: CommentStatus;
}

export interface QueryCommentDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  keyword?: string;
  status?: CommentStatus;
  postId?: string;
  userId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const commentsApi = {
  // 获取评论列表
  getComments: async (params?: QueryCommentDto): Promise<PaginatedResponse<Comment>> => {
    return apiClient.get<PaginatedResponse<Comment>>('/comments', { params });
  },

  // 获取评论详情
  getComment: async (id: string): Promise<Comment> => {
    return apiClient.get<Comment>(`/comments/${id}`);
  },

  // 创建评论
  createComment: async (data: CreateCommentDto): Promise<Comment> => {
    return apiClient.post<Comment>('/comments', data);
  },

  // 更新评论
  updateComment: async (id: string, data: UpdateCommentDto): Promise<Comment> => {
    return apiClient.post<Comment>(`/comments/${id}/update`, data);
  },

  // 删除评论
  deleteComment: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/comments/${id}/delete`);
  },

  // 通过评论
  approveComment: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/comments/${id}/approve`);
  },

  // 拒绝评论
  rejectComment: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/comments/${id}/reject`);
  },
};

