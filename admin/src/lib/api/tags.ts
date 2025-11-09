/**
 * 标签管理 API
 */

import { apiClient } from './client';
import type { PaginatedResponse } from './types';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTagDto {
  name: string;
  slug?: string;
  color?: string;
  categoryId?: string;
}

export interface UpdateTagDto {
  name?: string;
  slug?: string;
  color?: string;
  categoryId?: string;
}

export interface QueryTagDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  keyword?: string;
  categoryId?: string;
}

export const tagsApi = {
  // 获取标签列表
  getTags: async (params?: QueryTagDto): Promise<PaginatedResponse<Tag> | Tag[]> => {
    return apiClient.get<PaginatedResponse<Tag> | Tag[]>('/tags', { params });
  },

  // 获取标签详情
  getTag: async (id: string): Promise<Tag> => {
    return apiClient.get<Tag>(`/tags/${id}`);
  },

  // 创建标签
  createTag: async (data: CreateTagDto): Promise<Tag> => {
    return apiClient.post<Tag>('/tags', data);
  },

  // 更新标签
  updateTag: async (id: string, data: UpdateTagDto): Promise<Tag> => {
    return apiClient.post<Tag>(`/tags/${id}/update`, data);
  },

  // 删除标签
  deleteTag: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/tags/${id}/delete`);
  },
};
