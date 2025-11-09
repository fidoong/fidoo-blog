import { apiClient } from './client';

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
  getMenus: (): Promise<Menu[]> => {
    return apiClient.get<Menu[]>('/menus');
  },

  getMenuTree: (): Promise<Menu[]> => {
    return apiClient.get<Menu[]>('/menus/tree');
  },

  getMenu: (id: string): Promise<Menu> => {
    return apiClient.get<Menu>(`/menus/${id}`);
  },

  createMenu: (data: CreateMenuDto): Promise<Menu> => {
    return apiClient.post<Menu>('/menus', data);
  },

  updateMenu: (id: string, data: Partial<CreateMenuDto>): Promise<Menu> => {
    return apiClient.put<Menu>(`/menus/${id}`, data);
  },

  deleteMenu: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/menus/${id}`);
  },
};
