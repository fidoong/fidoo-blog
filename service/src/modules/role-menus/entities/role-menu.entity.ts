import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { Role } from '@/modules/roles/entities/role.entity';
import { Menu } from '@/modules/menus/entities/menu.entity';

@Entity('role_menus')
@Index(['roleId', 'menuId'], { unique: true })
export class RoleMenu extends BaseEntity {
  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, (role) => role.roleMenus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'menu_id' })
  menuId: string;

  @ManyToOne(() => Menu, (menu) => menu.roleMenus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;
}

