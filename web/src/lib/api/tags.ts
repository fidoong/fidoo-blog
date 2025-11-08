import { apiClient } from './client';
import type { ApiResponse, Tag } from './types';

export const tagsApi = {
  // 获取所有标签
  getTags: async (): Promise<ApiResponse<Tag[]>> => {
    const response = await apiClient.get('/tags');
    return response.data;
  },
};
