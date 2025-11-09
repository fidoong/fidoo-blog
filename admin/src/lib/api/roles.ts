import { apiClient } from './client';
import type { ApiResponse } from './types';

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
  getRoles: (): Promise<ApiResponse<Role[]>> => {
    return apiClient.get('/roles');
  },

  getRole: (id: string): Promise<ApiResponse<Role>> => {
    return apiClient.get(`/roles/${id}`);
  },

  createRole: (data: CreateRoleDto): Promise<ApiResponse<Role>> => {
    return apiClient.post('/roles', data);
  },

  updateRole: (id: string, data: Partial<CreateRoleDto>): Promise<ApiResponse<Role>> => {
    return apiClient.put(`/roles/${id}`, data);
  },

  deleteRole: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/roles/${id}`);
  },
};
