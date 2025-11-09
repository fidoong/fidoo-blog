import { apiClient } from './client';
import type { Tag, CreateTagDto, TagQueryParams, PaginatedResponse } from './types';

export interface UpdateTagDto {
  name?: string;
  slug?: string;
  color?: string;
  categoryId?: string | null;
}

export const tagsApi = {
  // 获取标签列表（支持增强查询条件，带分页）
  // 注意：为了向后兼容，此方法总是返回数组，即使传入了分页参数
  // 如果需要分页信息，请使用 getTagsPaginated
  getTags: async (params?: TagQueryParams): Promise<Tag[]> => {
    try {
      // 如果没有分页参数，返回所有标签（向后兼容）
      if (!params || (!params.page && !params.pageSize && !params.limit)) {
        const result = await apiClient.get<Tag[] | PaginatedResponse<Tag>>('/tags');
        // 防御性检查：如果返回的是分页响应，提取 items
        if (result && typeof result === 'object' && 'items' in result) {
          return (result as PaginatedResponse<Tag>).items || [];
        }
        return Array.isArray(result) ? result : [];
      }
      // 有分页参数时，返回分页数据，但提取 items 数组
      const response = await apiClient.get<PaginatedResponse<Tag>>('/tags', { params });
      return response?.items || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },

  // 获取标签列表（带分页信息）
  getTagsPaginated: async (params?: TagQueryParams): Promise<PaginatedResponse<Tag>> => {
    if (!params || (!params.page && !params.pageSize && !params.limit)) {
      // 如果没有分页参数，返回所有数据但包装成分页格式
      const items = await apiClient.get<Tag[]>('/tags');
      return {
        items,
        total: items.length,
        page: 1,
        pageSize: items.length,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false,
      };
    }
    return apiClient.get<PaginatedResponse<Tag>>('/tags', { params });
  },

  // 根据分类ID获取标签
  getTagsByCategory: async (categoryId: string): Promise<Tag[]> => {
    return apiClient.get<Tag[]>(`/tags/category/${categoryId}`);
  },

  // 通过slug获取标签
  getTagBySlug: async (slug: string): Promise<Tag> => {
    return apiClient.get<Tag>(`/tags/slug/${slug}`);
  },

  // 获取标签详情
  getTag: async (id: string): Promise<Tag> => {
    return apiClient.get<Tag>(`/tags/${id}`);
  },

  // 创建标签
  createTag: async (data: CreateTagDto): Promise<Tag> => {
    return apiClient.post<Tag>('/tags', data);
  },

  // 更新标签
  updateTag: async (id: string, data: UpdateTagDto): Promise<Tag> => {
    return apiClient.post<Tag>(`/tags/${id}/update`, data);
  },

  // 删除标签
  deleteTag: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/tags/${id}/delete`);
  },
};

