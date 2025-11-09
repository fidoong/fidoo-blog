import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { RoleMenu } from '@/modules/role-menus/entities/role-menu.entity';

export enum MenuType {
  MENU = 'menu', // 菜单
  BUTTON = 'button', // 按钮
  LINK = 'link', // 外链
}

export enum MenuStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

@Entity('menus')
@Index(['parentId', 'sortOrder'])
export class Menu extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 菜单名称

  @Column({ length: 200, nullable: true })
  title: string; // 显示标题

  @Column({ length: 200, nullable: true })
  path: string; // 路由路径

  @Column({ length: 100, nullable: true })
  component: string; // 组件路径

  @Column({ length: 200, nullable: true })
  icon: string; // 图标

  @Column({ length: 100, nullable: true, unique: true })
  code: string; // 菜单编码（唯一标识）

  @Column({ type: 'enum', enum: MenuType, default: MenuType.MENU })
  type: MenuType; // 菜单类型

  @Column({ name: 'parent_id', nullable: true })
  parentId: string; // 父菜单ID

  @ManyToOne(() => Menu, (menu) => menu.children, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number; // 排序

  @Column({ type: 'enum', enum: MenuStatus, default: MenuStatus.ENABLED })
  status: MenuStatus; // 状态

  @Column({ type: 'text', nullable: true })
  description: string; // 描述

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean; // 是否隐藏

  @Column({ name: 'is_cache', default: false })
  isCache: boolean; // 是否缓存

  @Column({ name: 'is_external', default: false })
  isExternal: boolean; // 是否外链

  @Column({ name: 'external_url', type: 'text', nullable: true })
  externalUrl: string; // 外链地址

  @Column({ name: 'permission_code', length: 100, nullable: true })
  permissionCode: string; // 关联的权限编码

  @OneToMany(() => RoleMenu, (roleMenu) => roleMenu.menu)
  roleMenus: RoleMenu[];
}
