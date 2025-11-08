import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { PostsService } from '@/modules/posts/posts.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { NotificationType } from '@/modules/notifications/entities/notification.entity';
import { BusinessException } from '@/common';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    private postsService: PostsService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * 收藏文章
   */
  async favorite(userId: string, postId: string): Promise<Favorite> {
    // 验证文章是否存在
    const post = await this.postsService.findOne(postId);

    // 检查是否已收藏
    const existingFavorite = await this.favoritesRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (existingFavorite) {
      throw BusinessException.conflict('已经收藏该文章');
    }

    const user = { id: userId } as User;
    const favorite = this.favoritesRepository.create({
      user,
      post: { id: postId } as Post,
    });

    const savedFavorite = await this.favoritesRepository.save(favorite);

    // 更新文章收藏数
    await this.postsService.incrementFavoriteCount(postId);

    // 发送通知（不给自己发通知）
    if (post.author.id !== userId) {
      await this.notificationsService.create({
        recipientId: post.author.id,
        senderId: userId,
        type: NotificationType.SYSTEM,
        title: '文章被收藏',
        content: `你的文章《${post.title}》被收藏了`,
        targetType: 'post',
        targetId: postId,
      });
    }

    return savedFavorite;
  }

  /**
   * 取消收藏
   */
  async unfavorite(userId: string, postId: string): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    if (!favorite) {
      throw BusinessException.notFound('未收藏该文章');
    }

    await this.favoritesRepository.remove(favorite);

    // 更新文章收藏数
    await this.postsService.decrementFavoriteCount(postId);
  }

  /**
   * 检查是否已收藏
   */
  async isFavorited(userId: string, postId: string): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    return !!favorite;
  }

  /**
   * 获取用户的收藏列表
   */
  async getUserFavorites(userId: string, page: number = 1, pageSize: number = 10) {
    const [favorites, total] = await this.favoritesRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['post', 'post.author', 'post.category', 'post.tags'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      items: favorites.map((favorite) => favorite.post),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
