/**
 * 菜单项类型定义
 */
export interface MenuItem {
  id: string;
  title: string;
  name: string;
  path?: string;
  icon?: string;
  status: 'enabled' | 'disabled';
  isHidden: boolean;
  children?: MenuItem[];
  permission?: string;
  sortOrder: number;
  parentId?: string;
  type?: 'menu' | 'button' | 'link';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 菜单树节点
 */
export type MenuTree = MenuItem[];
