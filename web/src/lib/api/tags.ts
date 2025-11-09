import { apiClient } from './client';
import type { Tag, PaginatedResponse } from './types';

export const tagsApi = {
  // 获取所有标签
  getTags: async (): Promise<Tag[]> => {
    try {
      const result = await apiClient.get<Tag[] | PaginatedResponse<Tag>>('/tags');
      // 防御性检查：如果返回的是分页响应，提取 items
      if (result && typeof result === 'object' && 'items' in result) {
        return (result as PaginatedResponse<Tag>).items || [];
      }
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },

  // 根据分类 ID 获取标签
  getTagsByCategoryId: async (categoryId: string): Promise<Tag[]> => {
    try {
      const result = await apiClient.get<Tag[]>(`/tags/category/${categoryId}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching tags by category:', error);
      return [];
    }
  },

  // 获取标签详情（通过ID）
  getTag: async (id: string): Promise<Tag> => {
    return apiClient.get<Tag>(`/tags/${id}`);
  },

  // 通过 slug 获取标签详情
  getTagBySlug: async (slug: string): Promise<Tag> => {
    return apiClient.get<Tag>(`/tags/slug/${slug}`);
  },
};
