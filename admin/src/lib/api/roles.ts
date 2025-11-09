import { apiClient } from './client';

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
  getRoles: (): Promise<Role[]> => {
    return apiClient.get<Role[]>('/roles');
  },

  getRole: (id: string): Promise<Role> => {
    return apiClient.get<Role>(`/roles/${id}`);
  },

  createRole: (data: CreateRoleDto): Promise<Role> => {
    return apiClient.post<Role>('/roles', data);
  },

  updateRole: (id: string, data: Partial<CreateRoleDto>): Promise<Role> => {
    return apiClient.put<Role>(`/roles/${id}`, data);
  },

  deleteRole: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/roles/${id}`);
  },
};
