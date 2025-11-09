/**
 * 菜单管理 API
 */

import { apiClient } from './client';
import type { PaginatedResponse } from './types';

export enum MenuType {
  MENU = 'menu',
  BUTTON = 'button',
  EXTERNAL = 'external',
}

export enum MenuStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

export interface Menu {
  id: string;
  name: string;
  title?: string;
  path?: string;
  component?: string;
  icon?: string;
  code?: string;
  type: MenuType;
  parentId?: string;
  sortOrder: number;
  status: MenuStatus;
  description?: string;
  isHidden: boolean;
  isCache: boolean;
  isExternal: boolean;
  externalUrl?: string;
  permissionCode?: string;
  children?: Menu[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMenuDto {
  name: string;
  title?: string;
  path?: string;
  component?: string;
  icon?: string;
  code?: string;
  type: MenuType;
  parentId?: string;
  sortOrder?: number;
  status?: MenuStatus;
  description?: string;
  isHidden?: boolean;
  isCache?: boolean;
  isExternal?: boolean;
  externalUrl?: string;
  permissionCode?: string;
}

export interface UpdateMenuDto {
  name?: string;
  title?: string;
  path?: string;
  component?: string;
  icon?: string;
  code?: string;
  type?: MenuType;
  parentId?: string;
  sortOrder?: number;
  status?: MenuStatus;
  description?: string;
  isHidden?: boolean;
  isCache?: boolean;
  isExternal?: boolean;
  externalUrl?: string;
  permissionCode?: string;
}

export interface QueryMenuDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  name?: string;
  type?: MenuType;
  status?: MenuStatus;
  parentId?: string;
}

export const menusApi = {
  // 获取菜单列表
  getMenus: async (params?: QueryMenuDto): Promise<PaginatedResponse<Menu> | Menu[]> => {
    return apiClient.get<PaginatedResponse<Menu> | Menu[]>('/menus', { params });
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
  updateMenu: async (id: string, data: UpdateMenuDto): Promise<Menu> => {
    return apiClient.put<Menu>(`/menus/${id}`, data);
  },

  // 删除菜单
  deleteMenu: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/menus/${id}`);
  },
};
