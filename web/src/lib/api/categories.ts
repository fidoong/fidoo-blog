import { apiClient } from './client';
import type { ApiResponse, Category } from './types';

export const categoriesApi = {
  // 获取所有分类（扁平列表）
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // 获取分类树形结构（大类及其子分类）
  getCategoryTree: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories/tree');
    return response.data;
  },

  // 获取所有大类（level = 0）
  getMainCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories/main');
    return response.data;
  },

  // 根据父分类 ID 获取子分类
  getCategoriesByParentId: async (parentId: string): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get(`/categories/parent/${parentId}`);
    return response.data;
  },

  // 获取分类详情（通过ID）
  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // 通过 slug 获取分类详情
  getCategoryBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get(`/categories/slug/${slug}`);
    return response.data;
  },

  // 获取分类树形结构及统计信息
  getCategoryTreeWithStats: async (): Promise<ApiResponse<(Category & { stats?: CategoryStats })[]>> => {
    const response = await apiClient.get('/categories/tree/stats');
    return response.data;
  },

  // 获取分类统计信息
  getCategoryStats: async (categoryId: string): Promise<ApiResponse<CategoryStats>> => {
    const response = await apiClient.get(`/categories/${categoryId}/stats`);
    return response.data;
  },
};

// 分类统计信息类型
export interface CategoryStats {
  categoryId: string;
  postCount: number;
  totalViews: number;
  totalLikes: number;
  tagCount: number;
  latestPostAt: string | null;
}
