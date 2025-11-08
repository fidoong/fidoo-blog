import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryStatsDto } from './dto/category-stats.dto';
import { BaseService } from '@/common/services';
import { CacheService } from '@/common/cache';
import { BusinessException } from '@/common';

@Injectable()
export class CategoriesService extends BaseService<Category> {
  protected readonly repository: Repository<Category>;

  constructor(
    @InjectRepository(Category)
    categoriesRepository: Repository<Category>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    cacheService?: CacheService,
  ) {
    super();
    this.repository = categoriesRepository;
    this.cacheService = cacheService;
  }

  protected getEntityName(): string {
    return 'Category';
  }

  protected getSearchFields(): string[] {
    return ['category.name', 'category.slug', 'category.description'];
  }

  protected getDefaultSortField(): string {
    return 'sortOrder';
  }

  /**
   * 查找所有分类（不分页，按排序顺序）
   */
  async findAllSorted(): Promise<Category[]> {
    return this.repository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 查找所有大类（level = 0）
   */
  async findMainCategories(): Promise<Category[]> {
    return this.repository.find({
      where: { level: 0, isActive: true },
      relations: ['children'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 查找树形结构的所有分类（大类及其子分类）
   */
  async findTree(): Promise<Category[]> {
    const mainCategories = await this.repository.find({
      where: { level: 0, isActive: true, parentId: IsNull() },
      relations: ['children'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    // 为每个大类加载子分类
    for (const mainCategory of mainCategories) {
      mainCategory.children = await this.repository.find({
        where: { parentId: mainCategory.id, isActive: true },
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      });
    }

    return mainCategories;
  }

  /**
   * 根据父分类 ID 查找子分类
   */
  async findByParentId(parentId: string): Promise<Category[]> {
    return this.repository.find({
      where: { parentId, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 根据 slug 查找分类（包含父分类和子分类信息）
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.repository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw BusinessException.notFound('分类不存在');
    }
    return category;
  }

  /**
   * 创建分类（重写以添加唯一性检查和树形结构处理）
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // 检查名称是否已存在
    const existingByName = await this.repository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (existingByName) {
      throw BusinessException.conflict('分类名称已存在', { field: 'name' });
    }

    // 检查 slug 是否已存在
    if (createCategoryDto.slug) {
      const existingBySlug = await this.repository.findOne({
        where: { slug: createCategoryDto.slug },
      });
      if (existingBySlug) {
        throw BusinessException.conflict('分类 slug 已存在', {
          field: 'slug',
        });
      }
    }

    // 处理树形结构
    let level = createCategoryDto.level;
    const parentId: string | null = createCategoryDto.parentId ?? null;

    // 如果提供了 parentId，验证父分类存在并自动设置 level
    if (parentId) {
      const parent = await this.repository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw BusinessException.notFound('父分类不存在');
      }
      // 自动设置 level 为父分类的 level + 1
      level = (parent.level ?? 0) + 1;
    } else {
      // 如果没有 parentId，默认为大类（level = 0）
      level = level ?? 0;
    }

    return super.create({
      ...createCategoryDto,
      parentId: parentId ?? undefined,
      level,
    });
  }

  /**
   * 获取分类统计信息
   */
  async getCategoryStats(categoryId: string): Promise<CategoryStatsDto> {
    const category = await this.repository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw BusinessException.notFound('分类不存在');
    }

    // 获取该分类及其所有子分类的 ID
    const categoryIds = [categoryId];
    if (category.level === 0) {
      // 如果是大类，获取所有子分类
      const children = await this.repository.find({
        where: { parentId: categoryId },
        select: ['id'],
      });
      categoryIds.push(...children.map((c) => c.id));
    }

    // 统计文章数、浏览量、点赞数
    const postStats = await this.postRepository
      .createQueryBuilder('post')
      .select('COUNT(post.id)', 'postCount')
      .addSelect('COALESCE(SUM(post.viewCount), 0)', 'totalViews')
      .addSelect('COALESCE(SUM(post.likeCount), 0)', 'totalLikes')
      .addSelect('MAX(post.publishedAt)', 'latestPostAt')
      .where('post.categoryId IN (:...categoryIds)', { categoryIds })
      .andWhere('post.status = :status', { status: 'published' })
      .getRawOne();

    // 统计标签数
    const tagCount = await this.tagRepository.count({
      where: { categoryId },
    });

    return {
      categoryId,
      postCount: parseInt(postStats?.postCount || '0', 10),
      totalViews: parseInt(postStats?.totalViews || '0', 10),
      totalLikes: parseInt(postStats?.totalLikes || '0', 10),
      tagCount,
      latestPostAt: postStats?.latestPostAt || null,
    };
  }

  /**
   * 获取所有分类的统计信息（用于分类列表页）
   */
  async getCategoriesWithStats(): Promise<(Category & { stats?: CategoryStatsDto })[]> {
    const categories = await this.findTree();

    // 为每个大类获取统计信息
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const stats = await this.getCategoryStats(category.id);
        return { ...category, stats };
      }),
    );

    return categoriesWithStats;
  }
}
