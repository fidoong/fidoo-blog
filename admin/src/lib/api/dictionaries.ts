/**
 * 字典管理 API
 */

import { apiClient } from './client';
import type { PaginatedResponse } from './types';

export enum DictionaryType {
  SYSTEM = 'system',
  BUSINESS = 'business',
  CUSTOM = 'custom',
}

export interface Dictionary {
  id: string;
  code: string;
  label: string;
  value: string;
  type: DictionaryType;
  parentId?: string;
  sortOrder: number;
  description?: string;
  isActive: boolean;
  children?: Dictionary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDictionaryDto {
  code: string;
  label: string;
  value: string;
  type?: DictionaryType;
  parentId?: string;
  sortOrder?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDictionaryDto {
  code?: string;
  label?: string;
  value?: string;
  type?: DictionaryType;
  parentId?: string;
  sortOrder?: number;
  description?: string;
  isActive?: boolean;
}

export interface QueryDictionaryDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  keyword?: string;
  code?: string;
  type?: DictionaryType;
  parentId?: string;
  isActive?: boolean;
}

export const dictionariesApi = {
  // 获取字典列表
  getDictionaries: async (params?: QueryDictionaryDto): Promise<PaginatedResponse<Dictionary>> => {
    return apiClient.get<PaginatedResponse<Dictionary>>('/dictionaries', { params });
  },

  // 获取字典树
  getDictionaryTree: async (code?: string): Promise<Dictionary[]> => {
    return apiClient.get<Dictionary[]>('/dictionaries/tree', {
      params: code ? { code } : undefined,
    });
  },

  // 获取字典详情
  getDictionary: async (id: string): Promise<Dictionary> => {
    return apiClient.get<Dictionary>(`/dictionaries/${id}`);
  },

  // 创建字典
  createDictionary: async (data: CreateDictionaryDto): Promise<Dictionary> => {
    return apiClient.post<Dictionary>('/dictionaries', data);
  },

  // 更新字典
  updateDictionary: async (id: string, data: UpdateDictionaryDto): Promise<Dictionary> => {
    return apiClient.put<Dictionary>(`/dictionaries/${id}`, data);
  },

  // 删除字典
  deleteDictionary: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/dictionaries/${id}`);
  },

  // 批量删除字典
  batchDeleteDictionaries: async (ids: string[]): Promise<void> => {
    return apiClient.post<void>('/dictionaries/batch-delete', { ids });
  },
};
