import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { BusinessException } from '@/common';

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
