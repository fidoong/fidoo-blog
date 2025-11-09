import { apiClient } from './client';
import type { RoleQueryParams, PaginatedResponse } from './types';

export interface Role {
  id: string;
  name: string;
  code: string;
  status: 'enabled' | 'disabled';
  description?: string;
  sortOrder: number;
  isSystem: boolean;
  rolePermissions?: Array<{ permission: { id: string; code: string; name: string } }>;
  roleMenus?: Array<{ menu: { id: string; name: string; title?: string } }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  code: string;
  status?: 'enabled' | 'disabled';
  description?: string;
  sortOrder?: number;
  permissionIds?: string[];
  menuIds?: string[];
}

export const rolesApi = {
  // 获取角色列表（支持增强查询条件，带分页）
  // 注意：为了向后兼容，此方法总是返回数组，即使传入了分页参数
  // 如果需要分页信息，请使用 getRolesPaginated
  getRoles: async (params?: RoleQueryParams): Promise<Role[]> => {
    try {
      // 如果没有分页参数，返回所有角色（向后兼容）
      if (!params || (!params.page && !params.pageSize && !params.limit)) {
        const result = await apiClient.get<Role[] | PaginatedResponse<Role>>('/roles');
        // 防御性检查：如果返回的是分页响应，提取 items
        if (result && typeof result === 'object' && 'items' in result) {
          return (result as PaginatedResponse<Role>).items || [];
        }
        return Array.isArray(result) ? result : [];
      }
      // 有分页参数时，返回分页数据，但提取 items 数组
      const response = await apiClient.get<PaginatedResponse<Role>>('/roles', { params });
      return response?.items || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  },

  // 获取角色列表（带分页信息）
  getRolesPaginated: async (params?: RoleQueryParams): Promise<PaginatedResponse<Role>> => {
    if (!params || (!params.page && !params.pageSize && !params.limit)) {
      // 如果没有分页参数，返回所有数据但包装成分页格式
      const items = await apiClient.get<Role[]>('/roles');
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
    return apiClient.get<PaginatedResponse<Role>>('/roles', { params });
  },

  // 获取角色详情
  getRole: async (id: string): Promise<Role> => {
    return apiClient.get<Role>(`/roles/${id}`);
  },

  // 创建角色
  createRole: async (data: CreateRoleDto): Promise<Role> => {
    return apiClient.post<Role>('/roles', data);
  },

  // 更新角色
  updateRole: async (id: string, data: Partial<CreateRoleDto>): Promise<Role> => {
    return apiClient.put<Role>(`/roles/${id}`, data);
  },

  // 删除角色
  deleteRole: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/roles/${id}`);
  },
};
