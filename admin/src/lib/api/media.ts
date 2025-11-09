import { apiClient } from './client';
import type { ApiResponse, Media, PaginatedResponse, PaginationParams } from './types';

export const mediaApi = {
  uploadFile: async (file: File): Promise<ApiResponse<Media>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMedia: async (params?: PaginationParams & { type?: string }): Promise<ApiResponse<PaginatedResponse<Media>>> => {
    const response = await apiClient.get('/media', { params });
    return response.data;
  },

  deleteMedia: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/media/${id}/delete`);
    return response.data;
  },
};

