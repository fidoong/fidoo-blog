import { apiClient } from './client';
import type { Tag } from './types';

export const tagsApi = {
  // 获取所有标签
  getTags: async (): Promise<Tag[]> => {
    return apiClient.get<Tag[]>('/tags');
  },

  // 根据分类 ID 获取标签
  getTagsByCategoryId: async (categoryId: string): Promise<Tag[]> => {
    return apiClient.get<Tag[]>(`/tags/category/${categoryId}`);
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
