import { Injectable } from '@nestjs/common';
import { Post, PostStatus } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CategoriesService } from '@/modules/categories/categories.service';
import { TagsService } from '@/modules/tags/tags.service';
import { QueryDto, PaginationResponseDto } from '@/common/dto';
import { QueryPostDto } from './dto/query-post.dto';
import { CacheService } from '@/common/cache';
import { BusinessException } from '@/common';
import { PostRepository } from './repositories/post.repository';
import { PostDomainService } from './domain/post.domain.service';

@Injectable()
export class PostsService {
  constructor(
    private postRepository: PostRepository,
    private postDomainService: PostDomainService,
    private categoriesService: CategoriesService,
    private tagsService: TagsService,
    private cacheService: CacheService,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    // 使用领域服务创建实体
    const post = this.postDomainService.createPost(createPostDto, authorId);

    // 验证是否可以发布
    if (createPostDto.status === PostStatus.PUBLISHED) {
      this.postDomainService.canPublish(post);
    }

    // 关联分类
    if (createPostDto.categoryId) {
      const category = await this.categoriesService.findOne({ id: createPostDto.categoryId });
      if (!category) {
        throw BusinessException.notFound('分类不存在');
      }
      post.category = category;
    }

    // 关联标签
    if (createPostDto.tagIds && createPostDto.tagIds.length > 0) {
      post.tags = await this.tagsService.findByIds(createPostDto.tagIds);
    }

    // 保存实体
    const savedPost = await this.postRepository.save(post);

    // 清除相关缓存
    await this.cacheService.delete('post:list:*');

    return savedPost;
  }

  async findAll(queryDto: QueryPostDto | QueryDto): Promise<PaginationResponseDto<Post>> {
    // 使用 Repository 查找文章（支持增强查询）
    const [posts, total] = await this.postRepository.findPublished(queryDto);

    const pageSize = queryDto.pageSize || queryDto.limit || 10;
    return new PaginationResponseDto(posts, total, queryDto.page || 1, pageSize);
  }

  async findOne(id: string): Promise<Post> {
    const cacheKey = `post:${id}`;

    // 尝试从缓存获取
    const cached = await this.cacheService.get<Post>(cacheKey);
    if (cached) {
      return cached;
    }

    const post = await this.postRepository.findByIdWithRelations(id);
    if (!post) {
      throw BusinessException.notFound('文章不存在');
    }

    // 存入缓存（5分钟）
    await this.cacheService.set(cacheKey, post, 300);

    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findBySlug(slug);
    if (!post) {
      throw BusinessException.notFound('文章不存在');
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);

    // 使用领域服务更新实体
    this.postDomainService.updatePost(post, updatePostDto);

    // 验证是否可以发布
    if (updatePostDto.status === PostStatus.PUBLISHED) {
      this.postDomainService.canPublish(post);
    }

    // 关联分类
    if (updatePostDto.categoryId !== undefined) {
      if (updatePostDto.categoryId) {
        const category = await this.categoriesService.findOne({ id: updatePostDto.categoryId });
        if (!category) {
          throw BusinessException.notFound('分类不存在');
        }
        post.category = category;
      } else {
        post.category = null;
      }
    }

    // 关联标签
    if (updatePostDto.tagIds !== undefined) {
      if (updatePostDto.tagIds && updatePostDto.tagIds.length > 0) {
        post.tags = await this.tagsService.findByIds(updatePostDto.tagIds);
      } else {
        post.tags = [];
      }
    }

    const updatedPost = await this.postRepository.save(post);

    // 清除缓存
    await this.cacheService.delete(`post:${id}`);
    await this.cacheService.delete('post:list:*');

    return updatedPost;
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.softRemove(post);

    // 清除缓存
    await this.cacheService.delete(`post:${id}`);
    await this.cacheService.delete('post:list:*');
  }

  async incrementViewCount(id: string): Promise<void> {
    const post = await this.findOne(id);
    this.postDomainService.incrementViewCount(post);
    await this.postRepository.save(post);
    await this.cacheService.delete(`post:${id}`);
  }

  async incrementLikeCount(id: string): Promise<void> {
    const post = await this.findOne(id);
    this.postDomainService.incrementLikeCount(post);
    await this.postRepository.save(post);
    await this.cacheService.delete(`post:${id}`);
  }

  async decrementLikeCount(id: string): Promise<void> {
    const post = await this.findOne(id);
    this.postDomainService.decrementLikeCount(post);
    await this.postRepository.save(post);
    await this.cacheService.delete(`post:${id}`);
  }

  async incrementFavoriteCount(id: string): Promise<void> {
    const post = await this.findOne(id);
    this.postDomainService.incrementFavoriteCount(post);
    await this.postRepository.save(post);
    await this.cacheService.delete(`post:${id}`);
  }

  async decrementFavoriteCount(id: string): Promise<void> {
    const post = await this.findOne(id);
    this.postDomainService.decrementFavoriteCount(post);
    await this.postRepository.save(post);
    await this.cacheService.delete(`post:${id}`);
  }
}
