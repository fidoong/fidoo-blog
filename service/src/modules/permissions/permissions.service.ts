import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { PaginationResponseDto } from '@/common/dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // 检查 code 是否唯一
    const existing = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code },
    });
    if (existing) {
      throw new BadRequestException('权限编码已存在');
    }

    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * 查找权限列表（支持增强查询条件，带分页）
   */
  async findAllEnhanced(queryDto: QueryPermissionDto): Promise<PaginationResponseDto<Permission>> {
    const {
      keyword,
      nameLike,
      code,
      codes,
      type,
      types,
      resource,
      action,
      path,
      method,
      status,
      statuses,
      parentId,
      rootOnly,
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

    const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

    // 处理软删除
    if (!includeDeleted) {
      queryBuilder.andWhere('permission.deletedAt IS NULL');
    }

    // 关键词搜索
    if (keyword) {
      queryBuilder.andWhere(
        '(permission.name LIKE :keyword OR permission.code LIKE :keyword OR permission.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 名称模糊匹配
    if (nameLike) {
      queryBuilder.andWhere('permission.name LIKE :nameLike', { nameLike: `%${nameLike}%` });
    }

    // 编码查询
    if (codes && codes.length > 0) {
      queryBuilder.andWhere('permission.code IN (:...codes)', { codes });
    } else if (code) {
      queryBuilder.andWhere('permission.code = :code', { code });
    }

    // 类型查询
    if (types && types.length > 0) {
      queryBuilder.andWhere('permission.type IN (:...types)', { types });
    } else if (type) {
      queryBuilder.andWhere('permission.type = :type', { type });
    }

    // 资源查询
    if (resource) {
      queryBuilder.andWhere('permission.resource = :resource', { resource });
    }

    // 操作查询
    if (action) {
      queryBuilder.andWhere('permission.action = :action', { action });
    }

    // 路径查询
    if (path) {
      queryBuilder.andWhere('permission.path LIKE :path', { path: `%${path}%` });
    }

    // 方法查询
    if (method) {
      queryBuilder.andWhere('permission.method = :method', { method });
    }

    // 状态查询
    if (statuses && statuses.length > 0) {
      queryBuilder.andWhere('permission.status IN (:...statuses)', { statuses });
    } else if (status) {
      queryBuilder.andWhere('permission.status = :status', { status });
    }

    // 父权限查询
    if (rootOnly) {
      queryBuilder.andWhere('permission.parentId IS NULL');
    } else if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('permission.parentId IS NULL');
      } else {
        queryBuilder.andWhere('permission.parentId = :parentId', { parentId });
      }
    }

    // ID列表查询
    if (ids && ids.length > 0) {
      queryBuilder.andWhere('permission.id IN (:...ids)', { ids });
    }

    // 日期范围查询
    if (createdAtFrom) {
      queryBuilder.andWhere('permission.createdAt >= :createdAtFrom', { createdAtFrom });
    }
    if (createdAtTo) {
      queryBuilder.andWhere('permission.createdAt <= :createdAtTo', { createdAtTo });
    }
    if (updatedAtFrom) {
      queryBuilder.andWhere('permission.updatedAt >= :updatedAtFrom', { updatedAtFrom });
    }
    if (updatedAtTo) {
      queryBuilder.andWhere('permission.updatedAt <= :updatedAtTo', { updatedAtTo });
    }

    // 排序
    const orderBy = sortBy || 'sortOrder';
    const orderDirection = sortOrder || 'ASC';
    queryBuilder.orderBy(`permission.${orderBy}`, orderDirection);
    if (orderBy !== 'createdAt') {
      queryBuilder.addOrderBy('permission.createdAt', 'ASC');
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

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException('权限不存在');
    }
    return permission;
  }

  async findByCode(code: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { code },
    });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    // 检查 code 是否唯一
    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existing = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code },
      });
      if (existing) {
        throw new BadRequestException('权限编码已存在');
      }
    }

    Object.assign(permission, updatePermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }
}
