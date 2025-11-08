import { Injectable } from '@nestjs/common';
import { Post, PostStatus } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { BusinessException } from '@/common';

/**
 * Post Domain Service
 * 负责 Post 领域的业务逻辑
 */
@Injectable()
export class PostDomainService {
  /**
   * 创建 Post 实体
   */
  createPost(dto: CreatePostDto, authorId: string): Post {
    const post = new Post();
    post.title = dto.title;
    post.slug = dto.slug;
    post.summary = dto.summary ?? null;
    post.content = dto.content;
    post.coverImage = dto.coverImage ?? null;
    post.status = dto.status;
    post.isFeatured = dto.isFeatured ?? false;
    post.isTop = dto.isTop ?? false;
    post.author = { id: authorId } as any;

    // 如果状态是已发布，设置发布时间
    if (dto.status === PostStatus.PUBLISHED) {
      post.publishedAt = new Date();
    }

    return post;
  }

  /**
   * 更新 Post 实体
   */
  updatePost(post: Post, dto: UpdatePostDto): void {
    if (dto.title !== undefined) post.title = dto.title;
    if (dto.slug !== undefined) post.slug = dto.slug;
    if (dto.summary !== undefined) post.summary = dto.summary ?? null;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.coverImage !== undefined) post.coverImage = dto.coverImage ?? null;
    if (dto.status !== undefined) {
      post.status = dto.status;
      // 如果从其他状态变为已发布，设置发布时间
      if (dto.status === PostStatus.PUBLISHED && post.publishedAt === null) {
        post.publishedAt = new Date();
      }
    }
    if (dto.isFeatured !== undefined) post.isFeatured = dto.isFeatured;
    if (dto.isTop !== undefined) post.isTop = dto.isTop;
  }

  /**
   * 验证 Post 是否可以发布
   */
  canPublish(post: Post): boolean {
    if (!post.title || post.title.trim().length === 0) {
      throw BusinessException.badRequest('文章标题不能为空');
    }
    if (!post.content || post.content.trim().length === 0) {
      throw BusinessException.badRequest('文章内容不能为空');
    }
    if (!post.slug || post.slug.trim().length === 0) {
      throw BusinessException.badRequest('文章 slug 不能为空');
    }
    return true;
  }

  /**
   * 增加浏览量
   */
  incrementViewCount(post: Post): void {
    post.viewCount = (post.viewCount || 0) + 1;
  }

  /**
   * 增加点赞数
   */
  incrementLikeCount(post: Post): void {
    post.likeCount = (post.likeCount || 0) + 1;
  }

  /**
   * 减少点赞数
   */
  decrementLikeCount(post: Post): void {
    post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
  }

  /**
   * 增加收藏数
   */
  incrementFavoriteCount(post: Post): void {
    post.favoriteCount = (post.favoriteCount || 0) + 1;
  }

  /**
   * 减少收藏数
   */
  decrementFavoriteCount(post: Post): void {
    post.favoriteCount = Math.max(0, (post.favoriteCount || 0) - 1);
  }
}
