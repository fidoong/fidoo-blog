import { apiClient } from './client';
import type { MenuQueryParams, PaginatedResponse } from './types';

export interface Menu {
  id: string;
  name: string;
  title?: string;
  path?: string;
  component?: string;
  icon?: string;
  code?: string;
  type: 'menu' | 'button' | 'link';
  parentId?: string;
  sortOrder: number;
  status: 'enabled' | 'disabled';
  description?: string;
  isHidden: boolean;
  isCache: boolean;
  isExternal: boolean;
  externalUrl?: string;
  permissionCode?: string;
  children?: Menu[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuDto {
  name: string;
  title?: string;
  path?: string;
  component?: string;
  icon?: string;
  code?: string;
  type?: 'menu' | 'button' | 'link';
  parentId?: string;
  sortOrder?: number;
  status?: 'enabled' | 'disabled';
  description?: string;
  isHidden?: boolean;
  isCache?: boolean;
  isExternal?: boolean;
  externalUrl?: string;
  permissionCode?: string;
}

export const menusApi = {
  // 获取菜单列表（支持增强查询条件，带分页）
  // 注意：为了向后兼容，此方法总是返回数组，即使传入了分页参数
  // 如果需要分页信息，请使用 getMenusPaginated
  getMenus: async (params?: MenuQueryParams): Promise<Menu[]> => {
    try {
      // 如果没有分页参数，返回所有菜单（向后兼容）
      if (!params || (!params.page && !params.pageSize && !params.limit)) {
        const result = await apiClient.get<Menu[] | PaginatedResponse<Menu>>('/menus');
        // 防御性检查：如果返回的是分页响应，提取 items
        if (result && typeof result === 'object' && 'items' in result) {
          return (result as PaginatedResponse<Menu>).items || [];
        }
        return Array.isArray(result) ? result : [];
      }
      // 有分页参数时，返回分页数据，但提取 items 数组
      const response = await apiClient.get<PaginatedResponse<Menu>>('/menus', { params });
      return response?.items || [];
    } catch (error) {
      console.error('Error fetching menus:', error);
      return [];
    }
  },

  // 获取菜单列表（带分页信息）
  getMenusPaginated: async (params?: MenuQueryParams): Promise<PaginatedResponse<Menu>> => {
    if (!params || (!params.page && !params.pageSize && !params.limit)) {
      // 如果没有分页参数，返回所有数据但包装成分页格式
      const items = await apiClient.get<Menu[]>('/menus');
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
    return apiClient.get<PaginatedResponse<Menu>>('/menus', { params });
  },

  // 获取菜单树
  getMenuTree: async (): Promise<Menu[]> => {
    return apiClient.get<Menu[]>('/menus/tree');
  },

  // 获取菜单详情
  getMenu: async (id: string): Promise<Menu> => {
    return apiClient.get<Menu>(`/menus/${id}`);
  },

  // 创建菜单
  createMenu: async (data: CreateMenuDto): Promise<Menu> => {
    return apiClient.post<Menu>('/menus', data);
  },

  // 更新菜单
  updateMenu: async (id: string, data: Partial<CreateMenuDto>): Promise<Menu> => {
    return apiClient.put<Menu>(`/menus/${id}`, data);
  },

  // 删除菜单
  deleteMenu: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/menus/${id}`);
  },
};
