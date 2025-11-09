import { apiClient } from './client';

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
  getPermissions: (): Promise<Permission[]> => {
    return apiClient.get<Permission[]>('/permissions');
  },

  getPermission: (id: string): Promise<Permission> => {
    return apiClient.get<Permission>(`/permissions/${id}`);
  },

  createPermission: (data: CreatePermissionDto): Promise<Permission> => {
    return apiClient.post<Permission>('/permissions', data);
  },

  updatePermission: (
    id: string,
    data: Partial<CreatePermissionDto>,
  ): Promise<Permission> => {
    return apiClient.put<Permission>(`/permissions/${id}`, data);
  },

  deletePermission: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/permissions/${id}`);
  },
};
