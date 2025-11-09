import { apiClient } from './client';
import type {
  Category,
  CreateCategoryDto,
  CategoryQueryParams,
  PaginatedResponse,
} from './types';

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
  // 获取分类列表（支持增强查询条件，带分页）
  // 注意：为了向后兼容，此方法总是返回数组，即使传入了分页参数
  // 如果需要分页信息，请使用 getCategoriesPaginated
  getCategories: async (params?: CategoryQueryParams): Promise<Category[]> => {
    try {
      // 如果没有分页参数，返回所有分类（向后兼容）
      if (!params || (!params.page && !params.pageSize && !params.limit)) {
        const result = await apiClient.get<Category[] | PaginatedResponse<Category>>('/categories');
        // 防御性检查：如果返回的是分页响应，提取 items
        if (result && typeof result === 'object' && 'items' in result) {
          return (result as PaginatedResponse<Category>).items || [];
        }
        return Array.isArray(result) ? result : [];
      }
      // 有分页参数时，返回分页数据，但提取 items 数组
      const response = await apiClient.get<PaginatedResponse<Category>>('/categories', { params });
      return response?.items || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // 获取分类列表（带分页信息）
  getCategoriesPaginated: async (
    params?: CategoryQueryParams,
  ): Promise<PaginatedResponse<Category>> => {
    if (!params || (!params.page && !params.pageSize && !params.limit)) {
      // 如果没有分页参数，返回所有数据但包装成分页格式
      const items = await apiClient.get<Category[]>('/categories');
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
    return apiClient.get<PaginatedResponse<Category>>('/categories', { params });
  },

  // 获取分类树形结构
  getCategoryTree: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories/tree');
  },

  // 获取分类树形结构及统计信息
  getCategoryTreeWithStats: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories/tree/stats');
  },

  // 获取所有大类（level = 0）
  getMainCategories: async (): Promise<Category[]> => {
    return apiClient.get<Category[]>('/categories/main');
  },

  // 根据父分类ID获取子分类
  getCategoriesByParent: async (parentId: string): Promise<Category[]> => {
    return apiClient.get<Category[]>(`/categories/parent/${parentId}`);
  },

  // 通过slug获取分类
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/slug/${slug}`);
  },

  // 获取分类详情
  getCategory: async (id: string): Promise<Category> => {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  // 获取分类统计信息
  getCategoryStats: async (id: string): Promise<{
    categoryId: string;
    postCount: number;
    totalViews: number;
    totalLikes: number;
    tagCount: number;
    latestPostAt: string | null;
  }> => {
    return apiClient.get(`/categories/${id}/stats`);
  },

  // 创建分类
  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    return apiClient.post<Category>('/categories', data);
  },

  // 更新分类
  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    return apiClient.post<Category>(`/categories/${id}/update`, data);
  },

  // 删除分类
  deleteCategory: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/categories/${id}/delete`);
  },
};

