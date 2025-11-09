import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { RolePermission } from '@/modules/role-permissions/entities/role-permission.entity';

export enum PermissionType {
  MENU = 'menu', // 菜单权限
  BUTTON = 'button', // 按钮权限
  API = 'api', // API权限
  DATA = 'data', // 数据权限
}

export enum PermissionStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

@Entity('permissions')
@Index(['code'], { unique: true })
export class Permission extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 权限名称

  @Column({ length: 100, unique: true })
  code: string; // 权限编码（唯一）

  @Column({ type: 'enum', enum: PermissionType })
  type: PermissionType; // 权限类型

  @Column({ length: 200, nullable: true })
  resource: string; // 资源标识（如：posts, users）

  @Column({ length: 200, nullable: true })
  action: string; // 操作标识（如：create, update, delete, view）

  @Column({ length: 500, nullable: true })
  path: string; // API路径（用于API权限）

  @Column({ length: 20, nullable: true })
  method: string; // HTTP方法（GET, POST, PUT, DELETE等）

  @Column({ type: 'enum', enum: PermissionStatus, default: PermissionStatus.ENABLED })
  status: PermissionStatus; // 状态

  @Column({ type: 'text', nullable: true })
  description: string; // 描述

  @Column({ name: 'parent_id', nullable: true })
  parentId: string; // 父权限ID（用于权限分组）

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number; // 排序

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[];
}
