import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post, PostStatus } from '../entities/post.entity';
import { BaseRepositoryService } from '@/common/services/base-repository.service';
import { QueryDto } from '@/common/dto';
import { QueryBuilderHelper } from '@/common/helpers';

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
   * 查找已发布的文章列表（带分页）
   */
  async findPublished(queryDto: QueryDto): Promise<[Post[], number]> {
    // 根据 status 参数决定使用哪个查询构建器
    // 如果 status 是 published 或未指定，使用已发布文章的查询构建器
    // 否则创建通用查询构建器并根据 status 过滤
    const status = queryDto.status;
    let queryBuilder: SelectQueryBuilder<Post>;

    if (status && status !== PostStatus.PUBLISHED) {
      // 如果指定了非 published 的状态，创建通用查询构建器
      queryBuilder = this.repository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('post.category', 'category')
        .leftJoinAndSelect('post.tags', 'tags')
        .where('post.status = :status', { status });
    } else {
      // 默认或 status=published 时，使用已发布文章的查询构建器
      queryBuilder = this.createPublishedQueryBuilder();
    }

    // 应用分类筛选
    if (queryDto.categoryId) {
      queryBuilder.andWhere('post.categoryId = :categoryId', { categoryId: queryDto.categoryId });
    }

    // 应用作者筛选
    if (queryDto.authorId) {
      queryBuilder.andWhere('post.authorId = :authorId', { authorId: queryDto.authorId });
    }

    // 应用关键词搜索
    if (queryDto.keyword) {
      QueryBuilderHelper.applyKeywordSearch(queryBuilder, queryDto.keyword, [
        'post.title',
        'post.content',
        'post.summary',
      ]);
    }

    // 应用日期范围
    if (queryDto.startDate || queryDto.endDate) {
      QueryBuilderHelper.applyDateRange(
        queryBuilder,
        'post.publishedAt',
        queryDto.startDate,
        queryDto.endDate,
      );
    }

    // 应用排序：置顶优先，然后按指定字段排序
    queryBuilder.orderBy('post.isTop', 'DESC');
    if (queryDto.sortBy) {
      const sortField = queryDto.sortBy.startsWith('post.')
        ? queryDto.sortBy
        : `post.${queryDto.sortBy}`;
      queryBuilder.addOrderBy(sortField, queryDto.sortOrder || 'DESC');
    } else {
      queryBuilder.addOrderBy('post.publishedAt', 'DESC');
    }

    // 应用分页
    QueryBuilderHelper.applyPagination(queryBuilder, queryDto);

    return queryBuilder.getManyAndCount();
  }

  /**
   * 根据分类查找文章
   */
  async findByCategory(categoryId: string, queryDto: QueryDto): Promise<[Post[], number]> {
    const queryBuilder = this.createPublishedQueryBuilder();
    queryBuilder.andWhere('post.categoryId = :categoryId', { categoryId });

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
