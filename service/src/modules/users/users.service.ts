import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryDto, PaginationResponseDto } from '@/common/dto';
import { QueryUserDto } from './dto/query-user.dto';
import { CryptoUtil } from '@/common/utils';
import { UserProfile } from '@/modules/user-profiles/entities/user-profile.entity';
import { BusinessException } from '@/common';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { RolePermission } from '@/modules/role-permissions/entities/role-permission.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Menu, MenuStatus } from '@/modules/menus/entities/menu.entity';
import { RoleMenu } from '@/modules/role-menus/entities/role-menu.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(RoleMenu)
    private roleMenuRepository: Repository<RoleMenu>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw BusinessException.conflict('用户名已存在', { field: 'username' });
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw BusinessException.conflict('邮箱已被注册', { field: 'email' });
    }

    const hashedPassword = await CryptoUtil.hashPassword(createUserDto.password);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // 创建用户扩展信息
    const profile = this.userProfileRepository.create({
      user: savedUser,
    });
    await this.userProfileRepository.save(profile);

    return savedUser;
  }

  async findAll(queryDto: QueryUserDto | QueryDto): Promise<PaginationResponseDto<User>> {
    const isEnhancedQuery =
      'username' in queryDto ||
      'usernameLike' in queryDto ||
      'email' in queryDto ||
      'roles' in queryDto;
    const query = isEnhancedQuery ? (queryDto as QueryUserDto) : null;
    const legacyQuery = !isEnhancedQuery ? (queryDto as QueryDto) : null;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // 处理软删除
    if (!query?.includeDeleted && !legacyQuery) {
      queryBuilder.andWhere('user.deletedAt IS NULL');
    }

    // 关键词搜索
    const keyword = query?.keyword || legacyQuery?.keyword;
    if (keyword) {
      queryBuilder.andWhere(
        '(user.username LIKE :keyword OR user.email LIKE :keyword OR user.nickname LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 用户名精确匹配
    if (query?.username) {
      queryBuilder.andWhere('user.username = :username', {
        username: query.username,
      });
    }

    // 用户名模糊匹配
    if (query?.usernameLike) {
      queryBuilder.andWhere('user.username LIKE :usernameLike', {
        usernameLike: `%${query.usernameLike}%`,
      });
    }

    // 邮箱精确匹配
    if (query?.email) {
      queryBuilder.andWhere('user.email = :email', { email: query.email });
    }

    // 邮箱模糊匹配
    if (query?.emailLike) {
      queryBuilder.andWhere('user.email LIKE :emailLike', { emailLike: `%${query.emailLike}%` });
    }

    // 昵称模糊匹配
    if (query?.nicknameLike) {
      queryBuilder.andWhere('user.nickname LIKE :nicknameLike', {
        nicknameLike: `%${query.nicknameLike}%`,
      });
    }

    // 角色查询
    if (query?.roles && query.roles.length > 0) {
      queryBuilder.andWhere('user.role IN (:...roles)', { roles: query.roles });
    } else if (query?.role) {
      queryBuilder.andWhere('user.role = :role', { role: query.role });
    }

    // 状态查询
    if (query?.statuses && query.statuses.length > 0) {
      queryBuilder.andWhere('user.status IN (:...statuses)', { statuses: query.statuses });
    } else if (query?.status) {
      queryBuilder.andWhere('user.status = :status', { status: query.status });
    }

    // ID列表查询
    if (query?.ids && query.ids.length > 0) {
      queryBuilder.andWhere('user.id IN (:...ids)', { ids: query.ids });
    }

    // 日期范围查询
    if (query?.createdAtFrom) {
      queryBuilder.andWhere('user.createdAt >= :createdAtFrom', {
        createdAtFrom: query.createdAtFrom,
      });
    }
    if (query?.createdAtTo) {
      queryBuilder.andWhere('user.createdAt <= :createdAtTo', { createdAtTo: query.createdAtTo });
    }
    if (query?.updatedAtFrom) {
      queryBuilder.andWhere('user.updatedAt >= :updatedAtFrom', {
        updatedAtFrom: query.updatedAtFrom,
      });
    }
    if (query?.updatedAtTo) {
      queryBuilder.andWhere('user.updatedAt <= :updatedAtTo', { updatedAtTo: query.updatedAtTo });
    }

    // 关联查询
    if (query?.includeProfile) {
      queryBuilder.leftJoinAndSelect('user.profile', 'profile');
    }
    if (query?.includeRoles) {
      queryBuilder
        .leftJoinAndSelect('user.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role');
    }
    // 如果没有指定关联，默认加载profile（向后兼容）
    if (!query || !query.includeProfile) {
      queryBuilder.leftJoinAndSelect('user.profile', 'profile');
    }

    // 排序
    const sortBy = query?.sortBy || legacyQuery?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder || legacyQuery?.sortOrder || 'DESC';
    const sortField = sortBy.startsWith('user.') ? sortBy : `user.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder);
    if (sortBy !== 'createdAt') {
      queryBuilder.addOrderBy('user.createdAt', 'DESC');
    }

    // 分页
    const skip = query?.skip ?? legacyQuery?.skip ?? 0;
    const take = query?.take ?? legacyQuery?.take ?? 10;
    queryBuilder.skip(skip).take(take);

    const [users, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(users, total, queryDto.page || 1, take);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw BusinessException.notFound('用户不存在');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['profile'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await CryptoUtil.hashPassword(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.softRemove(user);
  }

  async updateLastLogin(id: string, ip?: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      // 如果不存在，创建一个
      const user = await this.findById(userId);
      const newProfile = this.userProfileRepository.create({
        user: user,
      });
      return this.userProfileRepository.save(newProfile);
    }

    return profile;
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    Object.assign(profile, profileData);
    return this.userProfileRepository.save(profile);
  }

  /**
   * 获取用户的所有权限编码
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    // 获取用户的所有角色
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });

    if (userRoles.length === 0) {
      return [];
    }

    const roleIds = userRoles.map((ur) => ur.roleId);

    // 获取角色关联的所有权限
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId: In(roleIds) },
      relations: ['permission'],
    });

    // 提取权限编码
    const permissionCodes = rolePermissions
      .map((rp) => rp.permission?.code)
      .filter((code): code is string => !!code);

    return [...new Set(permissionCodes)]; // 去重
  }

  /**
   * 获取用户的菜单列表（返回完整的树形结构，支持多级递归）
   */
  async getUserMenus(userId: string): Promise<Menu[]> {
    // 获取用户的所有角色
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
    });

    if (userRoles.length === 0) {
      return [];
    }

    const roleIds = userRoles.map((ur) => ur.roleId);

    // 获取角色关联的所有菜单（包含父菜单信息）
    const roleMenus = await this.roleMenuRepository.find({
      where: { roleId: In(roleIds) },
      relations: ['menu', 'menu.parent'],
    });

    // 提取菜单并去重，同时收集所有需要的菜单（包括父菜单）
    const menuMap = new Map<string, Menu>();
    const parentMenuIds = new Set<string>();

    roleMenus.forEach((rm) => {
      if (rm.menu && rm.menu.status === 'enabled' && !rm.menu.isHidden) {
        menuMap.set(rm.menu.id, rm.menu);
        // 如果菜单有父菜单，也需要包含父菜单
        if (rm.menu.parentId) {
          parentMenuIds.add(rm.menu.parentId);
        }
      }
    });

    // 递归加载所有父菜单（包括祖父菜单等）
    const loadAllParents = async (menuIds: Set<string>) => {
      if (menuIds.size === 0) return;

      const missingParentIds = Array.from(menuIds).filter((id) => !menuMap.has(id));
      if (missingParentIds.length === 0) return;

      const parentMenus = await this.menuRepository.find({
        where: { id: In(missingParentIds), status: MenuStatus.ENABLED, isHidden: false },
      });

      const newParentIds = new Set<string>();
      parentMenus.forEach((menu) => {
        menuMap.set(menu.id, menu);
        if (menu.parentId && !menuMap.has(menu.parentId)) {
          newParentIds.add(menu.parentId);
        }
      });

      // 递归加载更上层的父菜单
      if (newParentIds.size > 0) {
        await loadAllParents(newParentIds);
      }
    };

    // 加载所有父菜单
    if (parentMenuIds.size > 0) {
      await loadAllParents(parentMenuIds);
    }

    // 获取所有菜单的扁平数组
    const allMenus = Array.from(menuMap.values());
    const allMenuIds = new Set(allMenus.map((m) => m.id));

    // 递归加载所有子菜单（包括子菜单的子菜单等）
    const loadAllChildren = async (menuId: string): Promise<Menu[]> => {
      const children = await this.menuRepository.find({
        where: { parentId: menuId, status: MenuStatus.ENABLED, isHidden: false },
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });

      // 递归加载每个子菜单的子菜单
      for (const child of children) {
        child.children = await loadAllChildren(child.id);
      }

      return children;
    };

    // 构建树形结构
    const menuTreeMap = new Map<string, Menu>();
    const rootMenus: Menu[] = [];

    // 创建菜单节点映射（深拷贝，避免修改原数据）
    allMenus.forEach((menu) => {
      menuTreeMap.set(menu.id, {
        ...menu,
        children: [],
      });
    });

    // 构建树形结构（基于用户有权限的菜单）
    allMenus.forEach((menu) => {
      const menuNode = menuTreeMap.get(menu.id)!;
      if (menu.parentId && menuTreeMap.has(menu.parentId)) {
        const parent = menuTreeMap.get(menu.parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(menuNode);
      } else {
        // 没有父菜单或父菜单不在列表中，作为根菜单
        rootMenus.push(menuNode);
      }
    });

    // 为每个菜单节点递归加载所有子菜单（包括用户没有直接权限但属于该菜单的子菜单）
    const enrichMenuTree = async (menus: Menu[]) => {
      for (const menu of menus) {
        // 加载该菜单的所有子菜单（包括多级）
        const allChildren = await loadAllChildren(menu.id);

        // 过滤：只保留用户有权限的子菜单，或者用户有权限的父菜单的子菜单
        // 如果用户有父菜单的权限，则显示所有子菜单
        const filteredChildren = allChildren.filter((child) => {
          // 如果子菜单在用户权限列表中，直接包含
          if (allMenuIds.has(child.id)) {
            return true;
          }
          // 如果用户有父菜单权限，也包含所有子菜单（用于显示完整结构）
          return allMenuIds.has(menu.id);
        });

        // 将子菜单添加到树中
        menu.children = filteredChildren.map((child) => {
          // 如果子菜单已经在 menuTreeMap 中，使用已有的节点
          if (menuTreeMap.has(child.id)) {
            return menuTreeMap.get(child.id)!;
          }
          // 否则创建新节点
          const childNode = {
            ...child,
            children: [],
          };
          menuTreeMap.set(child.id, childNode);
          return childNode;
        });

        // 递归处理子菜单
        if (menu.children.length > 0) {
          await enrichMenuTree(menu.children);
        }
      }
    };

    // 递归加载所有子菜单
    await enrichMenuTree(rootMenus);

    // 递归排序
    const sortMenus = (menus: Menu[]) => {
      menus.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      menus.forEach((menu) => {
        if (menu.children && menu.children.length > 0) {
          sortMenus(menu.children);
        }
      });
    };

    sortMenus(rootMenus);

    // 返回完整的树形结构
    return rootMenus;
  }

  /**
   * 检查用户是否有指定权限
   */
  async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permissionCode);
  }
}
