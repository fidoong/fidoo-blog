import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BaseService } from '@/common/services';
import { CacheService } from '@/common/cache';
import { BusinessException } from '@/common';

@Injectable()
export class CategoriesService extends BaseService<Category> {
  protected readonly repository: Repository<Category>;

  constructor(
    @InjectRepository(Category)
    categoriesRepository: Repository<Category>,
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
   * 根据 slug 查找分类
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.repository.findOne({ where: { slug } });
    if (!category) {
      throw BusinessException.notFound('分类不存在');
    }
    return category;
  }

  /**
   * 创建分类（重写以添加唯一性检查）
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

    return super.create(createCategoryDto);
  }
}
