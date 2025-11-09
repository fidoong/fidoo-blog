/**
 * 文章管理 API
 */

import { apiClient } from './client';
import type { PaginatedResponse } from './types';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  authorId: string;
  categoryId?: string;
  isTop?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostDto {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  coverImage?: string;
  status?: PostStatus;
  categoryId?: string;
  tagIds?: string[];
  isTop?: boolean;
  publishedAt?: string;
}

export interface UpdatePostDto {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  coverImage?: string;
  status?: PostStatus;
  categoryId?: string;
  tagIds?: string[];
  isTop?: boolean;
  publishedAt?: string;
}

export interface QueryPostDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  keyword?: string;
  status?: PostStatus;
  categoryId?: string;
  authorId?: string;
  isTop?: boolean;
}

export const postsApi = {
  // 获取文章列表
  getPosts: async (params?: QueryPostDto): Promise<PaginatedResponse<Post>> => {
    return apiClient.get<PaginatedResponse<Post>>('/posts', { params });
  },

  // 获取文章详情
  getPost: async (id: string): Promise<Post> => {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  // 创建文章
  createPost: async (data: CreatePostDto): Promise<Post> => {
    return apiClient.post<Post>('/posts', data);
  },

  // 更新文章
  updatePost: async (id: string, data: UpdatePostDto): Promise<Post> => {
    return apiClient.post<Post>(`/posts/${id}/update`, data);
  },

  // 删除文章
  deletePost: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/posts/${id}/delete`);
  },
};
