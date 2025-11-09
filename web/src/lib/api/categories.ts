import { apiClient } from './client';
import type { Category, PaginatedResponse } from './types';

// 分类统计信息类型
export interface CategoryStats {
  categoryId: string;
  postCount: number;
  totalViews: number;
  totalLikes: number;
  tagCount: number;
  latestPostAt: string | null;
}

export const categoriesApi = {
  // 获取所有分类（扁平列表）
  getCategories: async (): Promise<Category[]> => {
    try {
      const result = await apiClient.get<Category[] | PaginatedResponse<Category>>('/categories');
      // 防御性检查：如果返回的是分页响应，提取 items
      if (result && typeof result === 'object' && 'items' in result) {
        return (result as PaginatedResponse<Category>).items || [];
      }
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // 获取分类树形结构（大类及其子分类）
  getCategoryTree: async (): Promise<Category[]> => {
    try {
      const result = await apiClient.get<Category[]>('/categories/tree');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching category tree:', error);
      return [];
    }
  },

  // 获取所有大类（level = 0）
  getMainCategories: async (): Promise<Category[]> => {
    try {
      const result = await apiClient.get<Category[]>('/categories/main');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching main categories:', error);
      return [];
    }
  },

  // 根据父分类 ID 获取子分类
  getCategoriesByParentId: async (parentId: string): Promise<Category[]> => {
    try {
      const result = await apiClient.get<Category[]>(`/categories/parent/${parentId}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching categories by parent:', error);
      return [];
    }
  },

  // 获取分类详情（通过ID）
  getCategory: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  // 通过 slug 获取分类详情
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/slug/${slug}`);
  },

  // 获取分类树形结构及统计信息
  getCategoryTreeWithStats: async (): Promise<(Category & { stats?: CategoryStats })[]> => {
    try {
      const result = await apiClient.get<(Category & { stats?: CategoryStats })[]>(
        '/categories/tree/stats',
      );
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching category tree with stats:', error);
      return [];
    }
  },

  // 获取分类统计信息
  getCategoryStats: async (categoryId: string): Promise<CategoryStats> => {
    return apiClient.get<CategoryStats>(`/categories/${categoryId}/stats`);
  },
};
