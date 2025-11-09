import { apiClient } from './client';
import type {
  Post,
  PaginatedResponse,
  PostQueryParams,
  CreatePostDto,
} from './types';

export const postsApi = {
  getPosts: async (params?: PostQueryParams): Promise<PaginatedResponse<Post>> => {
    return apiClient.get<PaginatedResponse<Post>>('/posts', { params });
  },

  getPost: async (id: string): Promise<Post> => {
    return apiClient.get<Post>(`/posts/${id}`);
  },

  createPost: async (data: CreatePostDto): Promise<Post> => {
    return apiClient.post<Post>('/posts', data);
  },

  updatePost: async (id: string, data: Partial<CreatePostDto>): Promise<Post> => {
    return apiClient.post<Post>(`/posts/${id}/update`, data);
  },

  deletePost: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/posts/${id}/delete`);
  },
};

