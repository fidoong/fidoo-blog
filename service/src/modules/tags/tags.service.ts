import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { QueryTagDto } from './dto/query-tag.dto';
import { BaseService } from '@/common/services';
import { CacheService } from '@/common/cache';
import { BusinessException } from '@/common';
import { PaginationResponseDto } from '@/common/dto';

@Injectable()
export class TagsService extends BaseService<Tag> {
  protected readonly repository: Repository<Tag>;

  constructor(
    @InjectRepository(Tag)
    tagsRepository: Repository<Tag>,
    cacheService?: CacheService,
  ) {
    super();
    this.repository = tagsRepository;
    this.cacheService = cacheService;
  }

  protected getEntityName(): string {
    return 'Tag';
  }

  protected getSearchFields(): string[] {
    return ['tag.name', 'tag.slug'];
  }

  protected getDefaultSortField(): string {
    return 'createdAt';
  }

  /**
   * 查找所有标签（不分页）
   */
  async findAllSorted(): Promise<Tag[]> {
    return this.repository.find({
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查找标签列表（支持增强查询条件，带分页）
   */
  async findAll(queryDto: QueryTagDto): Promise<PaginationResponseDto<Tag>> {
    const {
      keyword,
      nameLike,
      slug,
      categoryId,
      categoryIds,
      color,
      includeCategory,
      includePostCount,
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

    const queryBuilder = this.repository.createQueryBuilder('tag');

    // 处理软删除
    if (!includeDeleted) {
      queryBuilder.andWhere('tag.deletedAt IS NULL');
    }

    // 关键词搜索
    if (keyword) {
      queryBuilder.andWhere('(tag.name LIKE :keyword OR tag.slug LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    // 名称模糊匹配
    if (nameLike) {
      queryBuilder.andWhere('tag.name LIKE :nameLike', { nameLike: `%${nameLike}%` });
    }

    // Slug精确匹配
    if (slug) {
      queryBuilder.andWhere('tag.slug = :slug', { slug });
    }

    // 分类查询
    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere('tag.categoryId IN (:...categoryIds)', { categoryIds });
    } else if (categoryId) {
      queryBuilder.andWhere('tag.categoryId = :categoryId', { categoryId });
    }

    // 颜色查询
    if (color) {
      queryBuilder.andWhere('tag.color = :color', { color });
    }

    // ID列表查询
    if (ids && ids.length > 0) {
      queryBuilder.andWhere('tag.id IN (:...ids)', { ids });
    }

    // 日期范围查询
    if (createdAtFrom) {
      queryBuilder.andWhere('tag.createdAt >= :createdAtFrom', { createdAtFrom });
    }
    if (createdAtTo) {
      queryBuilder.andWhere('tag.createdAt <= :createdAtTo', { createdAtTo });
    }
    if (updatedAtFrom) {
      queryBuilder.andWhere('tag.updatedAt >= :updatedAtFrom', { updatedAtFrom });
    }
    if (updatedAtTo) {
      queryBuilder.andWhere('tag.updatedAt <= :updatedAtTo', { updatedAtTo });
    }

    // 关联查询
    if (includeCategory) {
      queryBuilder.leftJoinAndSelect('tag.category', 'category');
    }

    // 排序
    const orderBy = sortBy || 'name';
    const orderDirection = sortOrder || 'ASC';
    queryBuilder.orderBy(`tag.${orderBy}`, orderDirection);
    if (orderBy !== 'createdAt') {
      queryBuilder.addOrderBy('tag.createdAt', 'ASC');
    }

    // 分页
    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    // 如果需要包含文章统计
    if (includePostCount) {
      for (const item of items) {
        const postCount = await this.repository
          .createQueryBuilder('tag')
          .innerJoin('tag.posts', 'post')
          .where('tag.id = :tagId', { tagId: item.id })
          .getCount();
        (item as any).postCount = postCount;
      }
    }

    return new PaginationResponseDto(items, total, queryDto.page || 1, take);
  }

  /**
   * 根据分类 ID 查找标签
   */
  async findByCategoryId(categoryId: string): Promise<Tag[]> {
    return this.repository.find({
      where: { categoryId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据 slug 查找标签
   */
  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.repository.findOne({
      where: { slug },
      relations: ['category'],
    });
    if (!tag) {
      throw BusinessException.notFound('标签不存在');
    }
    return tag;
  }

  /**
   * 根据 ID 数组查找标签
   */
  findByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.repository.find({
      where: { id: In(ids) },
    });
  }

  /**
   * 创建标签（重写以添加唯一性检查）
   */
  async create(createTagDto: CreateTagDto): Promise<Tag> {
    // 检查名称是否已存在
    const existingByName = await this.repository.findOne({
      where: { name: createTagDto.name },
    });
    if (existingByName) {
      throw BusinessException.conflict('标签名称已存在', { field: 'name' });
    }

    // 检查 slug 是否已存在
    if (createTagDto.slug) {
      const existingBySlug = await this.repository.findOne({
        where: { slug: createTagDto.slug },
      });
      if (existingBySlug) {
        throw BusinessException.conflict('标签 slug 已存在', {
          field: 'slug',
        });
      }
    }

    return super.create(createTagDto);
  }
}
