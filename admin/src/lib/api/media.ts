import { apiClient } from './client';
import type { Media, PaginatedResponse, PaginationParams } from './types';

export const mediaApi = {
  uploadFile: async (file: File): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<Media>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getMedia: async (params?: PaginationParams & { type?: string }): Promise<PaginatedResponse<Media>> => {
    return apiClient.get<PaginatedResponse<Media>>('/media', { params });
  },

  deleteMedia: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/media/${id}/delete`);
  },
};

