import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like, LikeType } from './entities/like.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { Comment } from '@/modules/comments/entities/comment.entity';
import { PostsService } from '@/modules/posts/posts.service';
import { CommentsService } from '@/modules/comments/comments.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { NotificationType } from '@/modules/notifications/entities/notification.entity';
import { BusinessException } from '@/common';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    private postsService: PostsService,
    private commentsService: CommentsService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * 点赞
   */
  async like(userId: string, targetType: LikeType, targetId: string): Promise<Like> {
    // 检查是否已点赞
    const existingLike = await this.likesRepository.findOne({
      where: {
        user: { id: userId },
        targetType,
        targetId,
      },
    });

    if (existingLike) {
      throw BusinessException.conflict('已经点赞');
    }

    // 验证目标是否存在
    await this.validateTarget(targetType, targetId);

    const user = { id: userId } as User;
    const like = this.likesRepository.create({
      user,
      targetType,
      targetId,
    });

    if (targetType === LikeType.POST) {
      like.post = { id: targetId } as Post;
      await this.postsService.incrementLikeCount(targetId);
    } else if (targetType === LikeType.COMMENT) {
      like.comment = { id: targetId } as Comment;
      await this.commentsService.incrementLikeCount(targetId);
    }

    const savedLike = await this.likesRepository.save(like);

    // 发送通知
    await this.sendLikeNotification(userId, targetType, targetId);

    return savedLike;
  }

  /**
   * 取消点赞
   */
  async unlike(userId: string, targetType: LikeType, targetId: string): Promise<void> {
    const like = await this.likesRepository.findOne({
      where: {
        user: { id: userId },
        targetType,
        targetId,
      },
    });

    if (!like) {
      throw BusinessException.notFound('未点赞');
    }

    await this.likesRepository.remove(like);

    // 更新统计
    if (targetType === LikeType.POST) {
      await this.postsService.decrementLikeCount(targetId);
    } else if (targetType === LikeType.COMMENT) {
      await this.commentsService.decrementLikeCount(targetId);
    }
  }

  /**
   * 检查是否已点赞
   */
  async isLiked(userId: string, targetType: LikeType, targetId: string): Promise<boolean> {
    const like = await this.likesRepository.findOne({
      where: {
        user: { id: userId },
        targetType,
        targetId,
      },
    });

    return !!like;
  }

  /**
   * 获取用户的点赞列表
   */
  async getUserLikes(
    userId: string,
    targetType?: LikeType,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const where: { user: { id: string }; targetType?: LikeType } = { user: { id: userId } };
    if (targetType) {
      where.targetType = targetType;
    }

    const [likes, total] = await this.likesRepository.findAndCount({
      where,
      relations: ['post', 'post.author', 'comment', 'comment.user'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      items: likes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 验证目标是否存在
   */
  private async validateTarget(targetType: LikeType, targetId: string): Promise<void> {
    if (targetType === LikeType.POST) {
      await this.postsService.findOne(targetId);
    } else if (targetType === LikeType.COMMENT) {
      await this.commentsService.findOne(targetId);
    } else {
      throw BusinessException.badRequest('无效的点赞类型', { targetType });
    }
  }

  /**
   * 发送点赞通知
   */
  private async sendLikeNotification(
    userId: string,
    targetType: LikeType,
    targetId: string,
  ): Promise<void> {
    try {
      let recipientId: string;
      let title: string;
      let content: string;

      if (targetType === LikeType.POST) {
        const post = await this.postsService.findOne(targetId);
        recipientId = post.author.id;
        title = '文章被点赞';
        content = `你的文章《${post.title}》收到了一个赞`;
      } else if (targetType === LikeType.COMMENT) {
        const comment = await this.commentsService.findOne(targetId);
        recipientId = comment.user.id;
        title = '评论被点赞';
        content = '你的评论收到了一个赞';
      } else {
        return;
      }

      // 不给自己发通知
      if (recipientId === userId) {
        return;
      }

      await this.notificationsService.create({
        recipientId,
        senderId: userId,
        type: NotificationType.LIKE,
        title,
        content,
        targetType: targetType,
        targetId,
      });
    } catch (error) {
      // 通知失败不影响点赞操作
      console.error('发送点赞通知失败:', error);
    }
  }
}
