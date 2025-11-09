import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { BusinessException } from '@/common';
import { PaginationResponseDto } from '@/common/dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
    ipAddress?: string,
  ): Promise<Comment> {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      user: { id: userId },
      post: { id: createCommentDto.postId },
      ipAddress,
    });

    if (createCommentDto.parentId) {
      comment.parent = { id: createCommentDto.parentId } as Comment;
    }

    return this.commentsRepository.save(comment);
  }

  async findByPost(postId: string, status?: CommentStatus) {
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.children', 'children')
      .leftJoinAndSelect('children.user', 'childUser')
      .where('comment.post.id = :postId', { postId })
      .andWhere('comment.parent IS NULL');

    if (status) {
      queryBuilder.andWhere('comment.status = :status', { status });
    }

    return queryBuilder.orderBy('comment.createdAt', 'DESC').getMany();
  }

  async findAll(page = 1, limit = 10, status?: CommentStatus) {
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post');

    if (status) {
      queryBuilder.where('comment.status = :status', { status });
    }

    const [comments, total] = await queryBuilder
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: comments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 查找评论列表（支持增强查询条件，带分页）
   */
  async findAllEnhanced(queryDto: QueryCommentDto): Promise<PaginationResponseDto<Comment>> {
    const {
      keyword,
      contentLike,
      status,
      statuses,
      userId,
      userIds,
      postId,
      postIds,
      parentId,
      rootOnly,
      minLikeCount,
      ids,
      createdAtFrom,
      createdAtTo,
      updatedAtFrom,
      updatedAtTo,
      includeDeleted,
      includeUser,
      includePost,
      includeChildren,
      sortBy,
      sortOrder,
      skip,
      take,
    } = queryDto;

    const queryBuilder = this.commentsRepository.createQueryBuilder('comment');

    // 处理软删除
    if (!includeDeleted) {
      queryBuilder.andWhere('comment.deletedAt IS NULL');
    }

    // 关键词搜索
    if (keyword) {
      queryBuilder.andWhere('comment.content LIKE :keyword', { keyword: `%${keyword}%` });
    }

    // 内容模糊匹配
    if (contentLike) {
      queryBuilder.andWhere('comment.content LIKE :contentLike', {
        contentLike: `%${contentLike}%`,
      });
    }

    // 状态查询
    if (statuses && statuses.length > 0) {
      queryBuilder.andWhere('comment.status IN (:...statuses)', { statuses });
    } else if (status) {
      queryBuilder.andWhere('comment.status = :status', { status });
    }

    // 用户查询
    if (userIds && userIds.length > 0) {
      queryBuilder.andWhere('comment.userId IN (:...userIds)', { userIds });
    } else if (userId) {
      queryBuilder.andWhere('comment.userId = :userId', { userId });
    }

    // 文章查询
    if (postIds && postIds.length > 0) {
      queryBuilder.andWhere('comment.postId IN (:...postIds)', { postIds });
    } else if (postId) {
      queryBuilder.andWhere('comment.postId = :postId', { postId });
    }

    // 父评论查询
    if (rootOnly) {
      queryBuilder.andWhere('comment.parentId IS NULL');
    } else if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('comment.parentId IS NULL');
      } else {
        queryBuilder.andWhere('comment.parentId = :parentId', { parentId });
      }
    }

    // 点赞数范围
    if (minLikeCount !== undefined) {
      queryBuilder.andWhere('comment.likeCount >= :minLikeCount', { minLikeCount });
    }

    // ID列表查询
    if (ids && ids.length > 0) {
      queryBuilder.andWhere('comment.id IN (:...ids)', { ids });
    }

    // 日期范围查询
    if (createdAtFrom) {
      queryBuilder.andWhere('comment.createdAt >= :createdAtFrom', { createdAtFrom });
    }
    if (createdAtTo) {
      queryBuilder.andWhere('comment.createdAt <= :createdAtTo', { createdAtTo });
    }
    if (updatedAtFrom) {
      queryBuilder.andWhere('comment.updatedAt >= :updatedAtFrom', { updatedAtFrom });
    }
    if (updatedAtTo) {
      queryBuilder.andWhere('comment.updatedAt <= :updatedAtTo', { updatedAtTo });
    }

    // 关联查询
    if (includeUser) {
      queryBuilder.leftJoinAndSelect('comment.user', 'user');
    }
    if (includePost) {
      queryBuilder.leftJoinAndSelect('comment.post', 'post');
    }
    if (includeChildren) {
      queryBuilder.leftJoinAndSelect('comment.children', 'children');
      if (includeUser) {
        queryBuilder.leftJoinAndSelect('children.user', 'childUser');
      }
    }

    // 排序
    const orderBy = sortBy || 'createdAt';
    const orderDirection = sortOrder || 'DESC';
    queryBuilder.orderBy(`comment.${orderBy}`, orderDirection);
    if (orderBy !== 'createdAt') {
      queryBuilder.addOrderBy('comment.createdAt', 'DESC');
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

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'post', 'parent'],
    });

    if (!comment) {
      throw BusinessException.notFound('评论不存在');
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateCommentDto);
    return this.commentsRepository.save(comment);
  }

  async remove(id: string): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentsRepository.softRemove(comment);
  }

  async approve(id: string): Promise<Comment> {
    return this.update(id, { status: CommentStatus.APPROVED });
  }

  async reject(id: string): Promise<Comment> {
    return this.update(id, { status: CommentStatus.REJECTED });
  }

  async incrementLikeCount(id: string): Promise<void> {
    await this.commentsRepository.increment({ id }, 'likeCount', 1);
  }

  async decrementLikeCount(id: string): Promise<void> {
    await this.commentsRepository.decrement({ id }, 'likeCount', 1);
  }
}
