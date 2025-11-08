import { apiClient } from './client';
import type { ApiResponse, Category } from './types';

export const categoriesApi = {
  // 获取所有分类
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // 获取分类详情
  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },
};
