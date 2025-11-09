import { apiClient } from './client';
import type { PermissionQueryParams, PaginatedResponse } from './types';

export interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api' | 'data';
  resource?: string;
  action?: string;
  path?: string;
  method?: string;
  status: 'enabled' | 'disabled';
  description?: string;
  parentId?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api' | 'data';
  resource?: string;
  action?: string;
  path?: string;
  method?: string;
  status?: 'enabled' | 'disabled';
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export const permissionsApi = {
  // 获取权限列表（支持增强查询条件，带分页）
  // 注意：为了向后兼容，此方法总是返回数组，即使传入了分页参数
  // 如果需要分页信息，请使用 getPermissionsPaginated
  getPermissions: async (params?: PermissionQueryParams): Promise<Permission[]> => {
    try {
      // 如果没有分页参数，返回所有权限（向后兼容）
      if (!params || (!params.page && !params.pageSize && !params.limit)) {
        const result = await apiClient.get<Permission[] | PaginatedResponse<Permission>>(
          '/permissions',
        );
        // 防御性检查：如果返回的是分页响应，提取 items
        if (result && typeof result === 'object' && 'items' in result) {
          return (result as PaginatedResponse<Permission>).items || [];
        }
        return Array.isArray(result) ? result : [];
      }
      // 有分页参数时，返回分页数据，但提取 items 数组
      const response = await apiClient.get<PaginatedResponse<Permission>>('/permissions', {
        params,
      });
      return response?.items || [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  },

  // 获取权限列表（带分页信息）
  getPermissionsPaginated: async (
    params?: PermissionQueryParams,
  ): Promise<PaginatedResponse<Permission>> => {
    if (!params || (!params.page && !params.pageSize && !params.limit)) {
      // 如果没有分页参数，返回所有数据但包装成分页格式
      const items = await apiClient.get<Permission[]>('/permissions');
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
    return apiClient.get<PaginatedResponse<Permission>>('/permissions', { params });
  },

  // 获取权限详情
  getPermission: async (id: string): Promise<Permission> => {
    return apiClient.get<Permission>(`/permissions/${id}`);
  },

  // 创建权限
  createPermission: async (data: CreatePermissionDto): Promise<Permission> => {
    return apiClient.post<Permission>('/permissions', data);
  },

  // 更新权限
  updatePermission: async (id: string, data: Partial<CreatePermissionDto>): Promise<Permission> => {
    return apiClient.put<Permission>(`/permissions/${id}`, data);
  },

  // 删除权限
  deletePermission: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/permissions/${id}`);
  },
};
