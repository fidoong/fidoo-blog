import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolePermission } from '@/modules/role-permissions/entities/role-permission.entity';
import { RoleMenu } from '@/modules/role-menus/entities/role-menu.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Menu } from '@/modules/menus/entities/menu.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(RoleMenu)
    private roleMenuRepository: Repository<RoleMenu>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // 检查 code 是否唯一
    const existing = await this.roleRepository.findOne({
      where: { code: createRoleDto.code },
    });
    if (existing) {
      throw new BadRequestException('角色编码已存在');
    }

    const role = this.roleRepository.create({
      name: createRoleDto.name,
      code: createRoleDto.code,
      status: createRoleDto.status,
      description: createRoleDto.description,
      sortOrder: createRoleDto.sortOrder,
    });
    const savedRole = await this.roleRepository.save(role);

    // 关联权限
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      await this.updateRolePermissions(savedRole.id, createRoleDto.permissionIds);
    }

    // 关联菜单
    if (createRoleDto.menuIds && createRoleDto.menuIds.length > 0) {
      await this.updateRoleMenus(savedRole.id, createRoleDto.menuIds);
    }

    return await this.findOne(savedRole.id);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['rolePermissions', 'rolePermissions.permission', 'roleMenus', 'roleMenus.menu'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission', 'roleMenus', 'roleMenus.menu'],
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  async findByCode(code: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { code },
      relations: ['rolePermissions', 'rolePermissions.permission', 'roleMenus', 'roleMenus.menu'],
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // 检查 code 是否唯一
    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existing = await this.roleRepository.findOne({
        where: { code: updateRoleDto.code },
      });
      if (existing) {
        throw new BadRequestException('角色编码已存在');
      }
    }

    // 系统角色不能修改状态
    if (role.isSystem && updateRoleDto.status && updateRoleDto.status !== role.status) {
      throw new BadRequestException('系统角色不能修改状态');
    }

    Object.assign(role, {
      name: updateRoleDto.name,
      code: updateRoleDto.code,
      status: updateRoleDto.status,
      description: updateRoleDto.description,
      sortOrder: updateRoleDto.sortOrder,
    });
    await this.roleRepository.save(role);

    // 更新权限关联
    if (updateRoleDto.permissionIds !== undefined) {
      await this.updateRolePermissions(id, updateRoleDto.permissionIds);
    }

    // 更新菜单关联
    if (updateRoleDto.menuIds !== undefined) {
      await this.updateRoleMenus(id, updateRoleDto.menuIds);
    }

    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('系统角色不能删除');
    }

    await this.roleRepository.remove(role);
  }

  private async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    // 删除现有关联
    await this.rolePermissionRepository.delete({ roleId });

    if (permissionIds.length === 0) {
      return;
    }

    // 验证权限是否存在
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });
    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('部分权限不存在');
    }

    // 创建新关联
    const rolePermissions = permissionIds.map((permissionId) =>
      this.rolePermissionRepository.create({ roleId, permissionId }),
    );
    await this.rolePermissionRepository.save(rolePermissions);
  }

  private async updateRoleMenus(roleId: string, menuIds: string[]): Promise<void> {
    // 删除现有关联
    await this.roleMenuRepository.delete({ roleId });

    if (menuIds.length === 0) {
      return;
    }

    // 验证菜单是否存在
    const menus = await this.menuRepository.find({
      where: { id: In(menuIds) },
    });
    if (menus.length !== menuIds.length) {
      throw new BadRequestException('部分菜单不存在');
    }

    // 创建新关联
    const roleMenus = menuIds.map((menuId) => this.roleMenuRepository.create({ roleId, menuId }));
    await this.roleMenuRepository.save(roleMenus);
  }
}
