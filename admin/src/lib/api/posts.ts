import { apiClient } from './client';
import type {
  ApiResponse,
  Post,
  PaginatedResponse,
  PostQueryParams,
  CreatePostDto,
} from './types';

export const postsApi = {
  getPosts: async (params?: PostQueryParams): Promise<ApiResponse<PaginatedResponse<Post>>> => {
    const response = await apiClient.get('/posts', { params });
    return response.data;
  },

  getPost: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (data: CreatePostDto): Promise<ApiResponse<Post>> => {
    const response = await apiClient.post('/posts', data);
    return response.data;
  },

  updatePost: async (id: string, data: Partial<CreatePostDto>): Promise<ApiResponse<Post>> => {
    const response = await apiClient.post(`/posts/${id}/update`, data);
    return response.data;
  },

  deletePost: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/posts/${id}/delete`);
    return response.data;
  },
};

