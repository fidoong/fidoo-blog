import { apiClient } from './client';
import type { Post, PaginatedResponse, PostQueryParams, CreatePostDto } from './types';

export const postsApi = {
  // 获取文章列表
  getPosts: async (params?: PostQueryParams): Promise<PaginatedResponse<Post>> => {
    return apiClient.get<PaginatedResponse<Post>>('/posts', { params });
  },

  // 获取文章详情
  getPost: async (id: string): Promise<Post> => {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  // 通过 slug 获取文章
  getPostBySlug: async (slug: string): Promise<Post> => {
    return apiClient.get<Post>(`/posts/slug/${slug}`);
  },

  // 创建文章
  createPost: async (data: CreatePostDto): Promise<Post> => {
    return apiClient.post<Post>('/posts', data);
  },

  // 更新文章
  updatePost: async (id: string, data: Partial<CreatePostDto>): Promise<Post> => {
    return apiClient.post<Post>(`/posts/${id}/update`, data);
  },

  // 删除文章
  deletePost: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/posts/${id}/delete`);
  },

  // 增加浏览量
  incrementViewCount: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/posts/${id}/view`);
  },

  // 点赞文章
  likePost: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/posts/${id}/like`);
  },
};
