import { apiClient } from './client';
import type { ApiResponse, Category, CreateCategoryDto } from './types';

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
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryDto): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post(`/categories/${id}/update`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post(`/categories/${id}/delete`);
    return response.data;
  },
};

