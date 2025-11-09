import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { RolePermission } from '@/modules/role-permissions/entities/role-permission.entity';
import { RoleMenu } from '@/modules/role-menus/entities/role-menu.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Menu } from '@/modules/menus/entities/menu.entity';
import { PaginationResponseDto } from '@/common/dto';

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

  /**
   * 查找角色列表（支持增强查询条件，带分页）
   */
  async findAllEnhanced(queryDto: QueryRoleDto): Promise<PaginationResponseDto<Role>> {
    const {
      keyword,
      nameLike,
      code,
      codes,
      status,
      statuses,
      isSystem,
      minSortOrder,
      maxSortOrder,
      ids,
      createdAtFrom,
      createdAtTo,
      updatedAtFrom,
      updatedAtTo,
      includeDeleted,
      sortBy,
      sortOrder,
      skip,
      take,
    } = queryDto;

    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // 处理软删除
    if (!includeDeleted) {
      queryBuilder.andWhere('role.deletedAt IS NULL');
    }

    // 关键词搜索
    if (keyword) {
      queryBuilder.andWhere(
        '(role.name LIKE :keyword OR role.code LIKE :keyword OR role.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 名称模糊匹配
    if (nameLike) {
      queryBuilder.andWhere('role.name LIKE :nameLike', { nameLike: `%${nameLike}%` });
    }

    // 编码查询
    if (codes && codes.length > 0) {
      queryBuilder.andWhere('role.code IN (:...codes)', { codes });
    } else if (code) {
      queryBuilder.andWhere('role.code = :code', { code });
    }

    // 状态查询
    if (statuses && statuses.length > 0) {
      queryBuilder.andWhere('role.status IN (:...statuses)', { statuses });
    } else if (status) {
      queryBuilder.andWhere('role.status = :status', { status });
    }

    // 系统角色查询
    if (isSystem !== undefined) {
      queryBuilder.andWhere('role.isSystem = :isSystem', { isSystem });
    }

    // 排序值范围
    if (minSortOrder !== undefined) {
      queryBuilder.andWhere('role.sortOrder >= :minSortOrder', { minSortOrder });
    }
    if (maxSortOrder !== undefined) {
      queryBuilder.andWhere('role.sortOrder <= :maxSortOrder', { maxSortOrder });
    }

    // ID列表查询
    if (ids && ids.length > 0) {
      queryBuilder.andWhere('role.id IN (:...ids)', { ids });
    }

    // 日期范围查询
    if (createdAtFrom) {
      queryBuilder.andWhere('role.createdAt >= :createdAtFrom', { createdAtFrom });
    }
    if (createdAtTo) {
      queryBuilder.andWhere('role.createdAt <= :createdAtTo', { createdAtTo });
    }
    if (updatedAtFrom) {
      queryBuilder.andWhere('role.updatedAt >= :updatedAtFrom', { updatedAtFrom });
    }
    if (updatedAtTo) {
      queryBuilder.andWhere('role.updatedAt <= :updatedAtTo', { updatedAtTo });
    }

    // 关联查询（默认加载）
    queryBuilder
      .leftJoinAndSelect('role.rolePermissions', 'rolePermissions')
      .leftJoinAndSelect('rolePermissions.permission', 'permission')
      .leftJoinAndSelect('role.roleMenus', 'roleMenus')
      .leftJoinAndSelect('roleMenus.menu', 'menu');

    // 排序
    const orderBy = sortBy || 'sortOrder';
    const orderDirection = sortOrder || 'ASC';
    queryBuilder.orderBy(`role.${orderBy}`, orderDirection);
    if (orderBy !== 'createdAt') {
      queryBuilder.addOrderBy('role.createdAt', 'ASC');
    }

    // 分页
    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(items, total, queryDto.page || 1, take);
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
