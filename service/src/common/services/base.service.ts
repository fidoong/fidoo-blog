import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { QueryDto, PaginationResponseDto } from '@/common/dto';
import { QueryBuilderHelper } from '@/common/helpers';
import { BusinessException } from '@/common';
import { CacheService } from '@/common/cache';

/**
 * 基础服务类
 * 提供通用的 CRUD 操作方法
 */
export abstract class BaseService<T extends BaseEntity> {
  protected abstract readonly repository: Repository<T>;
  protected cacheService?: CacheService;

  /**
   * 获取实体名称（用于缓存键）
   */
  protected abstract getEntityName(): string;

  /**
   * 获取搜索字段（用于关键词搜索）
   */
  protected getSearchFields(): string[] {
    return [];
  }

  /**
   * 获取默认排序字段
   */
  protected getDefaultSortField(): string {
    return 'createdAt';
  }

  /**
   * 获取缓存键前缀
   */
  protected getCacheKeyPrefix(): string {
    return `${this.getEntityName().toLowerCase()}`;
  }

  /**
   * 生成缓存键
   */
  protected getCacheKey(id: string): string {
    return `${this.getCacheKeyPrefix()}:${id}`;
  }

  /**
   * 生成列表缓存键
   */
  protected getListCacheKey(pattern?: string): string {
    return pattern
      ? `${this.getCacheKeyPrefix()}:list:${pattern}`
      : `${this.getCacheKeyPrefix()}:list:*`;
  }

  /**
   * 创建实体
   */
  async create(createDto: Partial<T>): Promise<T> {
    const entity = this.repository.create(createDto as T);
    const saved = await this.repository.save(entity);
    await this.clearListCache();
    return saved;
  }

  /**
   * 查找所有（带分页）
   */
  async findAll(queryDto?: QueryDto): Promise<PaginationResponseDto<T>> {
    const queryBuilder = this.repository.createQueryBuilder(this.getEntityName().toLowerCase());

    // 应用查询条件
    if (queryDto) {
      QueryBuilderHelper.applyQuery(
        queryBuilder,
        queryDto,
        this.getSearchFields(),
        this.getDefaultSortField(),
      );
    } else {
      // 如果没有查询条件，应用默认排序
      queryBuilder.orderBy(
        `${this.getEntityName().toLowerCase()}.${this.getDefaultSortField()}`,
        'DESC',
      );
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(items, total, queryDto?.page || 1, queryDto?.pageSize || 10);
  }

  /**
   * 查找所有（不分页）
   */
  async findAllWithoutPagination(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  /**
   * 根据 ID 查找
   */
  async findById(id: string, useCache: boolean = true): Promise<T> {
    if (useCache && this.cacheService) {
      const cacheKey = this.getCacheKey(id);
      const cached = await this.cacheService.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });

    if (!entity) {
      throw BusinessException.notFound(`${this.getEntityName()}不存在`);
    }

    if (useCache && this.cacheService) {
      const cacheKey = this.getCacheKey(id);
      await this.cacheService.set(cacheKey, entity, 300); // 5分钟缓存
    }

    return entity;
  }

  /**
   * 根据条件查找一个
   */
  async findOne(where: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.repository.findOne({ where });

    if (!entity) {
      throw BusinessException.notFound(`${this.getEntityName()}不存在`);
    }

    return entity;
  }

  /**
   * 更新实体
   */
  async update(id: string, updateDto: Partial<T>): Promise<T> {
    const entity = await this.findById(id, false);
    Object.assign(entity, updateDto);
    const updated = await this.repository.save(entity);

    // 清除缓存
    if (this.cacheService) {
      await this.cacheService.delete(this.getCacheKey(id));
      await this.clearListCache();
    }

    return updated;
  }

  /**
   * 删除实体（软删除）
   */
  async remove(id: string): Promise<void> {
    const entity = await this.findById(id, false);
    await this.repository.softRemove(entity);

    // 清除缓存
    if (this.cacheService) {
      await this.cacheService.delete(this.getCacheKey(id));
      await this.clearListCache();
    }
  }

  /**
   * 物理删除实体
   */
  async delete(id: string): Promise<void> {
    const entity = await this.findById(id, false);
    await this.repository.remove(entity);

    // 清除缓存
    if (this.cacheService) {
      await this.cacheService.delete(this.getCacheKey(id));
      await this.clearListCache();
    }
  }

  /**
   * 检查实体是否存在
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { id } as FindOptionsWhere<T>,
    });
    return count > 0;
  }

  /**
   * 根据条件检查是否存在
   */
  async existsBy(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  /**
   * 清除列表缓存
   */
  protected async clearListCache(): Promise<void> {
    if (this.cacheService) {
      await this.cacheService.delete(this.getListCacheKey());
    }
  }

  /**
   * 批量删除
   */
  async removeMany(ids: string[]): Promise<void> {
    await this.repository.softDelete(ids);

    // 清除缓存
    if (this.cacheService) {
      for (const id of ids) {
        await this.cacheService.delete(this.getCacheKey(id));
      }
      await this.clearListCache();
    }
  }

  /**
   * 批量更新
   */
  async updateMany(ids: string[], updateDto: Partial<T>): Promise<{ affected: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await this.repository.update(ids, updateDto as any);

    // 清除缓存
    if (this.cacheService) {
      for (const id of ids) {
        await this.cacheService.delete(this.getCacheKey(id));
      }
      await this.clearListCache();
    }

    return { affected: result.affected || 0 };
  }

  /**
   * 计数
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    if (where) {
      return this.repository.count({ where });
    }
    return this.repository.count();
  }

  /**
   * 创建未找到异常
   */
  protected createNotFoundException(message?: string): BusinessException {
    return BusinessException.notFound(message || `${this.getEntityName()}不存在`);
  }

  /**
   * 创建冲突异常
   */
  protected createConflictException(message: string, data?: unknown): BusinessException {
    return BusinessException.conflict(message, data);
  }

  /**
   * 创建验证错误异常
   */
  protected createValidationException(message: string, data?: unknown): BusinessException {
    return BusinessException.validationError(message, data);
  }
}
