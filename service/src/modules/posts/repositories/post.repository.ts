import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post, PostStatus } from '../entities/post.entity';
import { BaseRepositoryService } from '@/common/services/base-repository.service';
import { QueryDto } from '@/common/dto';
import { QueryBuilderHelper } from '@/common/helpers';
import { QueryPostDto } from '../dto/query-post.dto';

/**
 * Post Repository
 * 负责 Post 实体的数据访问操作
 */
@Injectable()
export class PostRepository extends BaseRepositoryService<Post> {
  constructor(
    @InjectRepository(Post)
    protected readonly repository: Repository<Post>,
  ) {
    super(repository);
  }

  /**
   * 根据 slug 查找文章（带关联）
   */
  async findBySlug(slug: string): Promise<Post | null> {
    return this.repository.findOne({
      where: { slug },
      relations: ['author', 'category', 'tags'],
    });
  }

  /**
   * 根据 ID 查找文章（带关联）
   */
  async findByIdWithRelations(id: string): Promise<Post | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags'],
    });
  }

  /**
   * 查找文章列表（带分页，支持增强查询条件）
   */
  async findPublished(queryDto: QueryPostDto | QueryDto): Promise<[Post[], number]> {
    const isEnhancedQuery = 'statuses' in queryDto || 'authorIds' in queryDto;
    const query = isEnhancedQuery ? (queryDto as QueryPostDto) : null;
    const legacyQuery = !isEnhancedQuery ? (queryDto as QueryDto) : null;

    // 创建查询构建器
    const queryBuilder = this.repository.createQueryBuilder('post');

    // 处理软删除
    if (!query?.includeDeleted && !legacyQuery) {
      queryBuilder.andWhere('post.deletedAt IS NULL');
    }

    // 状态筛选
    if (query?.statuses && query.statuses.length > 0) {
      queryBuilder.andWhere('post.status IN (:...statuses)', { statuses: query.statuses });
    } else if (query?.status) {
      queryBuilder.andWhere('post.status = :status', { status: query.status });
    } else if (legacyQuery?.status) {
      queryBuilder.andWhere('post.status = :status', { status: legacyQuery.status });
    } else {
      // 默认只查询已发布的文章
      queryBuilder.andWhere('post.status = :status', { status: PostStatus.PUBLISHED });
    }

    // 标题模糊匹配
    if (query?.titleLike) {
      queryBuilder.andWhere('post.title LIKE :titleLike', { titleLike: `%${query.titleLike}%` });
    }

    // Slug精确匹配
    if (query?.slug) {
      queryBuilder.andWhere('post.slug = :slug', { slug: query.slug });
    }

    // 作者筛选
    if (query?.authorIds && query.authorIds.length > 0) {
      queryBuilder.andWhere('post.authorId IN (:...authorIds)', { authorIds: query.authorIds });
    } else if (query?.authorId) {
      queryBuilder.andWhere('post.authorId = :authorId', { authorId: query.authorId });
    } else if (legacyQuery?.authorId) {
      queryBuilder.andWhere('post.authorId = :authorId', { authorId: legacyQuery.authorId });
    }

    // 分类筛选
    if (query?.categoryIds && query.categoryIds.length > 0) {
      queryBuilder.andWhere('post.categoryId IN (:...categoryIds)', {
        categoryIds: query.categoryIds,
      });
    } else if (query?.categoryId) {
      queryBuilder.andWhere('post.categoryId = :categoryId', { categoryId: query.categoryId });
    } else if (legacyQuery?.categoryId) {
      // 支持大类查询（查找所有子分类的文章）
      if (legacyQuery.categoryLevel === 0) {
        queryBuilder.andWhere(
          `post.categoryId IN (
            SELECT id FROM categories WHERE parent_id = :categoryId
          )`,
          { categoryId: legacyQuery.categoryId },
        );
      } else {
        queryBuilder.andWhere('post.categoryId = :categoryId', {
          categoryId: legacyQuery.categoryId,
        });
      }
    }

    // 标签筛选
    if (query?.tagIds && query.tagIds.length > 0) {
      queryBuilder.innerJoin('post.tags', 'tag').andWhere('tag.id IN (:...tagIds)', {
        tagIds: query.tagIds,
      });
    } else if (query?.tagId) {
      queryBuilder.innerJoin('post.tags', 'tag').andWhere('tag.id = :tagId', {
        tagId: query.tagId,
      });
    }

    // 精选/置顶筛选
    if (query?.isFeatured !== undefined) {
      queryBuilder.andWhere('post.isFeatured = :isFeatured', { isFeatured: query.isFeatured });
    }
    if (query?.isTop !== undefined) {
      queryBuilder.andWhere('post.isTop = :isTop', { isTop: query.isTop });
    }

    // 浏览量范围
    if (query?.minViewCount !== undefined) {
      queryBuilder.andWhere('post.viewCount >= :minViewCount', {
        minViewCount: query.minViewCount,
      });
    }
    if (query?.maxViewCount !== undefined) {
      queryBuilder.andWhere('post.viewCount <= :maxViewCount', {
        maxViewCount: query.maxViewCount,
      });
    }

    // 点赞数范围
    if (query?.minLikeCount !== undefined) {
      queryBuilder.andWhere('post.likeCount >= :minLikeCount', {
        minLikeCount: query.minLikeCount,
      });
    }
    if (query?.maxLikeCount !== undefined) {
      queryBuilder.andWhere('post.likeCount <= :maxLikeCount', {
        maxLikeCount: query.maxLikeCount,
      });
    }

    // 发布时间范围
    if (query?.publishedAtFrom) {
      queryBuilder.andWhere('post.publishedAt >= :publishedAtFrom', {
        publishedAtFrom: query.publishedAtFrom,
      });
    }
    if (query?.publishedAtTo) {
      queryBuilder.andWhere('post.publishedAt <= :publishedAtTo', {
        publishedAtTo: query.publishedAtTo,
      });
    } else if (legacyQuery?.startDate || legacyQuery?.endDate) {
      QueryBuilderHelper.applyDateRange(
        queryBuilder,
        'post.publishedAt',
        legacyQuery.startDate,
        legacyQuery.endDate,
      );
    }

    // 创建/更新时间范围
    if (query?.createdAtFrom) {
      queryBuilder.andWhere('post.createdAt >= :createdAtFrom', {
        createdAtFrom: query.createdAtFrom,
      });
    }
    if (query?.createdAtTo) {
      queryBuilder.andWhere('post.createdAt <= :createdAtTo', {
        createdAtTo: query.createdAtTo,
      });
    }
    if (query?.updatedAtFrom) {
      queryBuilder.andWhere('post.updatedAt >= :updatedAtFrom', {
        updatedAtFrom: query.updatedAtFrom,
      });
    }
    if (query?.updatedAtTo) {
      queryBuilder.andWhere('post.updatedAt <= :updatedAtTo', {
        updatedAtTo: query.updatedAtTo,
      });
    }

    // ID列表查询
    if (query?.ids && query.ids.length > 0) {
      queryBuilder.andWhere('post.id IN (:...ids)', { ids: query.ids });
    }

    // 关键词搜索
    const keyword = query?.keyword || legacyQuery?.keyword;
    if (keyword) {
      queryBuilder.andWhere(
        '(post.title LIKE :keyword OR post.content LIKE :keyword OR post.summary LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 关联查询
    if (query?.includeAuthor) {
      queryBuilder.leftJoinAndSelect('post.author', 'author');
    }
    if (query?.includeCategory) {
      queryBuilder.leftJoinAndSelect('post.category', 'category');
    }
    if (query?.includeTags) {
      queryBuilder.leftJoinAndSelect('post.tags', 'tags');
    }
    if (query?.includeComments) {
      queryBuilder.leftJoinAndSelect('post.comments', 'comments');
    }
    // 如果没有指定关联，默认加载作者、分类、标签（向后兼容）
    if (!query || (!query.includeAuthor && !query.includeCategory && !query.includeTags)) {
      queryBuilder
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.category', 'category')
        .leftJoinAndSelect('post.tags', 'tags');
    }

    // 排序：置顶优先，然后按指定字段排序
    queryBuilder.orderBy('post.isTop', 'DESC');
    const sortBy = query?.sortBy || legacyQuery?.sortBy || 'publishedAt';
    const sortOrder = query?.sortOrder || legacyQuery?.sortOrder || 'DESC';
    const sortField = sortBy.startsWith('post.') ? sortBy : `post.${sortBy}`;
    queryBuilder.addOrderBy(sortField, sortOrder);
    // 添加额外的排序字段以确保结果稳定
    if (sortBy !== 'createdAt') {
      queryBuilder.addOrderBy('post.createdAt', 'DESC');
    }

    // 应用分页
    const skip = query?.skip ?? legacyQuery?.skip ?? 0;
    const take = query?.take ?? legacyQuery?.take ?? 10;
    queryBuilder.skip(skip).take(take);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 根据分类查找文章（支持大类，会查找所有子分类的文章）
   */
  async findByCategory(
    categoryId: string,
    queryDto: QueryDto,
    categoryLevel?: number,
  ): Promise<[Post[], number]> {
    const queryBuilder = this.createPublishedQueryBuilder();

    // 如果传入的 categoryLevel 是 0（大类），需要查找所有子分类的文章
    if (categoryLevel === 0) {
      // 使用子查询查找所有子分类的 ID
      queryBuilder.andWhere(
        `post.categoryId IN (
          SELECT id FROM categories WHERE parent_id = :categoryId
        )`,
        { categoryId },
      );
    } else {
      // 子分类或普通分类，直接查找该分类下的文章
      queryBuilder.andWhere('post.categoryId = :categoryId', { categoryId });
    }

    // 应用其他查询条件
    if (queryDto.keyword) {
      QueryBuilderHelper.applyKeywordSearch(queryBuilder, queryDto.keyword, [
        'post.title',
        'post.content',
        'post.summary',
      ]);
    }

    // 应用排序和分页
    queryBuilder.orderBy('post.isTop', 'DESC').addOrderBy('post.publishedAt', 'DESC');
    QueryBuilderHelper.applyPagination(queryBuilder, queryDto);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 根据标签查找文章
   */
  async findByTag(tagId: string, queryDto: QueryDto): Promise<[Post[], number]> {
    const queryBuilder = this.createPublishedQueryBuilder();
    queryBuilder.innerJoin('post.tags', 'tag').andWhere('tag.id = :tagId', { tagId });

    // 应用其他查询条件
    if (queryDto.keyword) {
      QueryBuilderHelper.applyKeywordSearch(queryBuilder, queryDto.keyword, [
        'post.title',
        'post.content',
        'post.summary',
      ]);
    }

    // 应用排序和分页
    queryBuilder.orderBy('post.isTop', 'DESC').addOrderBy('post.publishedAt', 'DESC');
    QueryBuilderHelper.applyPagination(queryBuilder, queryDto);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 查找热门文章
   */
  async findHot(limit: number = 10): Promise<Post[]> {
    return this.createPublishedQueryBuilder()
      .orderBy('post.viewCount', 'DESC')
      .addOrderBy('post.likeCount', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 创建已发布文章的查询构建器
   */
  private createPublishedQueryBuilder(): SelectQueryBuilder<Post> {
    return this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.status = :status', { status: PostStatus.PUBLISHED });
  }
}
