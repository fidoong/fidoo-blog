import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { RolePermission } from '@/modules/role-permissions/entities/role-permission.entity';
import { RoleMenu } from '@/modules/role-menus/entities/role-menu.entity';

export enum RoleStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

@Entity('roles')
@Index(['code'], { unique: true })
export class Role extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 角色名称

  @Column({ length: 100, unique: true })
  code: string; // 角色编码（唯一）

  @Column({ type: 'enum', enum: RoleStatus, default: RoleStatus.ENABLED })
  status: RoleStatus; // 状态

  @Column({ type: 'text', nullable: true })
  description: string; // 描述

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number; // 排序

  @Column({ name: 'is_system', default: false })
  isSystem: boolean; // 是否系统角色（系统角色不可删除）

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => RoleMenu, (roleMenu) => roleMenu.role)
  roleMenus: RoleMenu[];
}

