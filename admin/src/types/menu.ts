/**
 * 菜单项类型定义
 * 与后端 MenuResponseDto 保持一致
 */
export interface MenuItem {
  id: string;
  name: string;
  title: string;
  path?: string;
  component?: string;
  icon?: string;
  code?: string;
  type: 'menu' | 'button' | 'link';
  parentId?: string;
  sortOrder: number;
  status: 'enabled' | 'disabled';
  isHidden: boolean;
  permission?: string;
  children?: MenuItem[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * 菜单树节点
 */
export type MenuTree = MenuItem[];
