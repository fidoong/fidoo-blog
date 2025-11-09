/**
 * 分类管理 API
 */

import { apiClient } from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  icon?: string;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  level?: number;
  sortOrder?: number;
  isActive?: boolean;
  icon?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  level?: number;
  sortOrder?: number;
  isActive?: boolean;
  icon?: string;
}

export interface QueryCategoryDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  keyword?: string;
  parentId?: string;
  level?: number;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const categoriesApi = {
  // 获取分类列表
  getCategories: async (params?: QueryCategoryDto): Promise<PaginatedResponse<Category> | Category[]> => {
    return apiClient.get<PaginatedResponse<Category> | Category[]>('/categories', { params });
  },

  // 获取分类树
  getCategoryTree: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories/tree');
  },

  // 获取分类详情
  getCategory: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  // 创建分类
  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    return apiClient.post<Category>('/categories', data);
  },

  // 更新分类
  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    return apiClient.post<Category>(`/categories/${id}/update`, data);
  },

  // 删除分类
  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/categories/${id}/delete`);
  },
};

