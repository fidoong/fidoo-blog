import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { BaseService } from '@/common/services';
import { CacheService } from '@/common/cache';
import { BusinessException } from '@/common';

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
