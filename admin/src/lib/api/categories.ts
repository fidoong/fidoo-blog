import { apiClient } from './client';
import type { Category, CreateCategoryDto } from './types';

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  icon?: string | null;
}

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories');
  },

  getCategory: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    return apiClient.post<Category>('/categories', data);
  },

  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    return apiClient.post<Category>(`/categories/${id}/update`, data);
  },

  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/categories/${id}/delete`);
  },
};

