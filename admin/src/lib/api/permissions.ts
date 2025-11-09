/**
 * 权限管理 API
 */

import { apiClient } from './client';

export enum PermissionType {
  MENU = 'menu',
  BUTTON = 'button',
  API = 'api',
  DATA = 'data',
}

export enum PermissionStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  type: PermissionType;
  resource?: string;
  action?: string;
  path?: string;
  method?: string;
  status: PermissionStatus;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermissionDto {
  name: string;
  code: string;
  type: PermissionType;
  resource?: string;
  action?: string;
  path?: string;
  method?: string;
  status?: PermissionStatus;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdatePermissionDto {
  name?: string;
  code?: string;
  type?: PermissionType;
  resource?: string;
  action?: string;
  path?: string;
  method?: string;
  status?: PermissionStatus;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface QueryPermissionDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  nameLike?: string;
  code?: string;
  type?: PermissionType;
  resource?: string;
  status?: PermissionStatus;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const permissionsApi = {
  // 获取权限列表
  getPermissions: async (params?: QueryPermissionDto): Promise<PaginatedResponse<Permission> | Permission[]> => {
    return apiClient.get<PaginatedResponse<Permission> | Permission[]>('/permissions', { params });
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
  updatePermission: async (id: string, data: UpdatePermissionDto): Promise<Permission> => {
    return apiClient.put<Permission>(`/permissions/${id}`, data);
  },

  // 删除权限
  deletePermission: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/permissions/${id}`);
  },
};

