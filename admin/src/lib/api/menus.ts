import { apiClient } from './client';
import type { ApiResponse } from './types';

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
  getMenus: (): Promise<ApiResponse<Menu[]>> => {
    return apiClient.get('/menus');
  },

  getMenuTree: (): Promise<ApiResponse<Menu[]>> => {
    return apiClient.get('/menus/tree');
  },

  getMenu: (id: string): Promise<ApiResponse<Menu>> => {
    return apiClient.get(`/menus/${id}`);
  },

  createMenu: (data: CreateMenuDto): Promise<ApiResponse<Menu>> => {
    return apiClient.post('/menus', data);
  },

  updateMenu: (id: string, data: Partial<CreateMenuDto>): Promise<ApiResponse<Menu>> => {
    return apiClient.put(`/menus/${id}`, data);
  },

  deleteMenu: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/menus/${id}`);
  },
};
