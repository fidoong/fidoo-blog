import { apiClient } from './client';
import type { ApiResponse } from './types';

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
  getPermissions: (): Promise<ApiResponse<Permission[]>> => {
    return apiClient.get('/permissions');
  },

  getPermission: (id: string): Promise<ApiResponse<Permission>> => {
    return apiClient.get(`/permissions/${id}`);
  },

  createPermission: (data: CreatePermissionDto): Promise<ApiResponse<Permission>> => {
    return apiClient.post('/permissions', data);
  },

  updatePermission: (
    id: string,
    data: Partial<CreatePermissionDto>,
  ): Promise<ApiResponse<Permission>> => {
    return apiClient.put(`/permissions/${id}`, data);
  },

  deletePermission: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/permissions/${id}`);
  },
};
