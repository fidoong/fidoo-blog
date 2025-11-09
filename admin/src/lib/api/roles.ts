/**
 * 角色管理 API
 */

import { apiClient } from './client';
import type { PaginatedResponse } from './types';

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem?: boolean;
  permissions?: string[];
  menus?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  permissionIds?: string[];
  menuIds?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  permissionIds?: string[];
  menuIds?: string[];
}

export interface QueryRoleDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  name?: string;
  code?: string;
}

export const rolesApi = {
  // 获取角色列表
  getRoles: async (params?: QueryRoleDto): Promise<PaginatedResponse<Role> | Role[]> => {
    return apiClient.get<PaginatedResponse<Role> | Role[]>('/roles', { params });
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
  updateRole: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    return apiClient.put<Role>(`/roles/${id}`, data);
  },

  // 删除角色
  deleteRole: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/roles/${id}`);
  },
};
