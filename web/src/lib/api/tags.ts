import { apiClient } from './client';
import type { ApiResponse, Tag } from './types';

export const tagsApi = {
  // 获取所有标签
  getTags: async (): Promise<ApiResponse<Tag[]>> => {
    const response = await apiClient.get('/tags');
    return response.data;
  },

  // 根据分类 ID 获取标签
  getTagsByCategoryId: async (categoryId: string): Promise<ApiResponse<Tag[]>> => {
    const response = await apiClient.get(`/tags/category/${categoryId}`);
    return response.data;
  },

  // 获取标签详情（通过ID）
  getTag: async (id: string): Promise<ApiResponse<Tag>> => {
    const response = await apiClient.get(`/tags/${id}`);
    return response.data;
  },

  // 通过 slug 获取标签详情
  getTagBySlug: async (slug: string): Promise<ApiResponse<Tag>> => {
    const response = await apiClient.get(`/tags/slug/${slug}`);
    return response.data;
  },
};
