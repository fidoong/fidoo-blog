import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { PaginationResponseDto } from '@/common/dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    // 检查 code 是否唯一
    if (createMenuDto.code) {
      const existing = await this.menuRepository.findOne({
        where: { code: createMenuDto.code },
      });
      if (existing) {
        throw new BadRequestException('菜单编码已存在');
      }
    }

    // 检查父菜单是否存在
    if (createMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({
        where: { id: createMenuDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('父菜单不存在');
      }
    }

    const menu = this.menuRepository.create(createMenuDto);
    return await this.menuRepository.save(menu);
  }

  async findAll(): Promise<Menu[]> {
    return await this.menuRepository.find({
      where: {},
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * 查找菜单列表（支持增强查询条件，带分页）
   */
  async findAllEnhanced(queryDto: QueryMenuDto): Promise<PaginationResponseDto<Menu>> {
    const {
      keyword,
      nameLike,
      titleLike,
      code,
      codes,
      type,
      types,
      status,
      statuses,
      parentId,
      rootOnly,
      isHidden,
      isCache,
      isExternal,
      permissionCode,
      includeChildren,
      includeParent,
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

    const queryBuilder = this.menuRepository.createQueryBuilder('menu');

    // 处理软删除
    if (!includeDeleted) {
      queryBuilder.andWhere('menu.deletedAt IS NULL');
    }

    // 关键词搜索
    if (keyword) {
      queryBuilder.andWhere(
        '(menu.name LIKE :keyword OR menu.title LIKE :keyword OR menu.code LIKE :keyword OR menu.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 名称模糊匹配
    if (nameLike) {
      queryBuilder.andWhere('menu.name LIKE :nameLike', { nameLike: `%${nameLike}%` });
    }

    // 标题模糊匹配
    if (titleLike) {
      queryBuilder.andWhere('menu.title LIKE :titleLike', { titleLike: `%${titleLike}%` });
    }

    // 编码查询
    if (codes && codes.length > 0) {
      queryBuilder.andWhere('menu.code IN (:...codes)', { codes });
    } else if (code) {
      queryBuilder.andWhere('menu.code = :code', { code });
    }

    // 类型查询
    if (types && types.length > 0) {
      queryBuilder.andWhere('menu.type IN (:...types)', { types });
    } else if (type) {
      queryBuilder.andWhere('menu.type = :type', { type });
    }

    // 状态查询
    if (statuses && statuses.length > 0) {
      queryBuilder.andWhere('menu.status IN (:...statuses)', { statuses });
    } else if (status) {
      queryBuilder.andWhere('menu.status = :status', { status });
    }

    // 父菜单查询
    if (rootOnly) {
      queryBuilder.andWhere('menu.parentId IS NULL');
    } else if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('menu.parentId IS NULL');
      } else {
        queryBuilder.andWhere('menu.parentId = :parentId', { parentId });
      }
    }

    // 布尔字段查询
    if (isHidden !== undefined) {
      queryBuilder.andWhere('menu.isHidden = :isHidden', { isHidden });
    }
    if (isCache !== undefined) {
      queryBuilder.andWhere('menu.isCache = :isCache', { isCache });
    }
    if (isExternal !== undefined) {
      queryBuilder.andWhere('menu.isExternal = :isExternal', { isExternal });
    }

    // 权限编码查询
    if (permissionCode) {
      queryBuilder.andWhere('menu.permissionCode = :permissionCode', { permissionCode });
    }

    // ID列表查询
    if (ids && ids.length > 0) {
      queryBuilder.andWhere('menu.id IN (:...ids)', { ids });
    }

    // 日期范围查询
    if (createdAtFrom) {
      queryBuilder.andWhere('menu.createdAt >= :createdAtFrom', { createdAtFrom });
    }
    if (createdAtTo) {
      queryBuilder.andWhere('menu.createdAt <= :createdAtTo', { createdAtTo });
    }
    if (updatedAtFrom) {
      queryBuilder.andWhere('menu.updatedAt >= :updatedAtFrom', { updatedAtFrom });
    }
    if (updatedAtTo) {
      queryBuilder.andWhere('menu.updatedAt <= :updatedAtTo', { updatedAtTo });
    }

    // 关联查询
    if (includeParent) {
      queryBuilder.leftJoinAndSelect('menu.parent', 'parent');
    }
    if (includeChildren) {
      queryBuilder.leftJoinAndSelect('menu.children', 'children');
    }

    // 排序
    const orderBy = sortBy || 'sortOrder';
    const orderDirection = sortOrder || 'ASC';
    queryBuilder.orderBy(`menu.${orderBy}`, orderDirection);
    if (orderBy !== 'createdAt') {
      queryBuilder.addOrderBy('menu.createdAt', 'ASC');
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

  async findTree(): Promise<Menu[]> {
    const menus = await this.menuRepository.find({
      where: { parentId: IsNull() },
      relations: ['children'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    // 递归加载子菜单
    const loadChildren = async (menu: Menu) => {
      const children = await this.menuRepository.find({
        where: { parentId: menu.id },
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });
      menu.children = children;
      for (const child of children) {
        await loadChildren(child);
      }
    };

    for (const menu of menus) {
      await loadChildren(menu);
    }

    return menus;
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);

    // 检查 code 是否唯一
    if (updateMenuDto.code && updateMenuDto.code !== menu.code) {
      const existing = await this.menuRepository.findOne({
        where: { code: updateMenuDto.code },
      });
      if (existing) {
        throw new BadRequestException('菜单编码已存在');
      }
    }

    // 检查父菜单是否存在且不能是自己
    if (updateMenuDto.parentId) {
      if (updateMenuDto.parentId === id) {
        throw new BadRequestException('不能将自己设为父菜单');
      }
      const parent = await this.menuRepository.findOne({
        where: { id: updateMenuDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('父菜单不存在');
      }
    }

    Object.assign(menu, updateMenuDto);
    return await this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);

    // 检查是否有子菜单
    const children = await this.menuRepository.find({
      where: { parentId: id },
    });
    if (children.length > 0) {
      throw new BadRequestException('存在子菜单，无法删除');
    }

    await this.menuRepository.remove(menu);
  }

  async findByRoleIds(roleIds: string[]): Promise<Menu[]> {
    if (roleIds.length === 0) {
      return [];
    }

    return await this.menuRepository
      .createQueryBuilder('menu')
      .innerJoin('menu.roleMenus', 'roleMenu')
      .where('roleMenu.roleId IN (:...roleIds)', { roleIds })
      .andWhere('menu.status = :status', { status: 'enabled' })
      .orderBy('menu.sortOrder', 'ASC')
      .getMany();
  }
}
