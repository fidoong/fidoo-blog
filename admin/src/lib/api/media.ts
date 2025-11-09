/**
 * 媒体管理 API
 */

import { apiClient } from './client';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: MediaType;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryMediaDto {
  page?: number;
  limit?: number;
  type?: MediaType;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const mediaApi = {
  // 获取媒体列表
  getMedia: async (params?: QueryMediaDto): Promise<PaginatedResponse<Media>> => {
    return apiClient.get<PaginatedResponse<Media>>('/media', { params });
  },

  // 获取媒体详情
  getMediaItem: async (id: string): Promise<Media> => {
    return apiClient.get<Media>(`/media/${id}`);
  },

  // 上传文件
  uploadFile: async (file: File): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<Media>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 删除媒体
  deleteMedia: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/media/${id}/delete`);
  },
};

