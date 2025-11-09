import { apiClient } from './client';
import type { Category } from './types';

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
    return apiClient.get<Category[]>('/categories');
  },

  // 获取分类树形结构（大类及其子分类）
  getCategoryTree: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories/tree');
  },

  // 获取所有大类（level = 0）
  getMainCategories: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories/main');
  },

  // 根据父分类 ID 获取子分类
  getCategoriesByParentId: async (parentId: string): Promise<Category[]> => {
    return apiClient.get<Category[]>(`/categories/parent/${parentId}`);
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
    return apiClient.get<(Category & { stats?: CategoryStats })[]>('/categories/tree/stats');
  },

  // 获取分类统计信息
  getCategoryStats: async (categoryId: string): Promise<CategoryStats> => {
    return apiClient.get<CategoryStats>(`/categories/${categoryId}/stats`);
  },
};
