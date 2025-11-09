import { apiClient } from './client';
import type { ApiResponse, Tag, CreateTagDto } from './types';

export interface UpdateTagDto {
  name?: string;
  slug?: string;
  color?: string;
  categoryId?: string | null;
}

export const tagsApi = {
  getTags: async (): Promise<ApiResponse<Tag[]>> => {
    const response = await apiClient.get('/tags');
    return response.data;
  },

  getTag: async (id: string): Promise<ApiResponse<Tag>> => {
    const response = await apiClient.get(`/tags/${id}`);
    return response.data;
  },

  createTag: async (data: CreateTagDto): Promise<ApiResponse<Tag>> => {
    const response = await apiClient.post('/tags', data);
    return response.data;
  },

  updateTag: async (id: string, data: UpdateTagDto): Promise<ApiResponse<Tag>> => {
    const response = await apiClient.post(`/tags/${id}/update`, data);
    return response.data;
  },

  deleteTag: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/tags/${id}/delete`);
    return response.data;
  },
};

