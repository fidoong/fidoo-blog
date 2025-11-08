import { apiClient } from './client';
import type { ApiResponse, Post, PaginatedResponse, PostQueryParams, CreatePostDto } from './types';

export const postsApi = {
  // 获取文章列表
  getPosts: async (params?: PostQueryParams): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const response = await apiClient.get('/posts', { params });
    return response.data;
  },

  // 获取文章详情
  getPost: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },

  // 通过 slug 获取文章
  getPostBySlug: async (slug: string): Promise<ApiResponse<Post>> => {
    const response = await apiClient.get(`/posts/slug/${slug}`);
    return response.data;
  },

  // 创建文章
  createPost: async (data: CreatePostDto): Promise<ApiResponse<Post>> => {
    const response = await apiClient.post('/posts', data);
    return response.data;
  },

  // 更新文章
  updatePost: async (id: string, data: Partial<CreatePostDto>): Promise<ApiResponse<Post>> => {
    const response = await apiClient.post(`/posts/${id}/update`, data);
    return response.data;
  },

  // 删除文章
  deletePost: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/posts/${id}/delete`);
    return response.data;
  },

  // 增加浏览量
  incrementViewCount: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/posts/${id}/view`);
    return response.data;
  },

  // 点赞文章
  likePost: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/posts/${id}/like`);
    return response.data;
  },
};
