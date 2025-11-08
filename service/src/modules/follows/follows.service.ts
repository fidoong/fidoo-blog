import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { UsersService } from '@/modules/users/users.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { NotificationType } from '@/modules/notifications/entities/notification.entity';
import { BusinessException } from '@/common';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * 关注用户
   */
  async follow(followerId: string, followingId: string): Promise<Follow> {
    if (followerId === followingId) {
      throw BusinessException.badRequest('不能关注自己');
    }

    const follower = await this.usersService.findById(followerId);
    const following = await this.usersService.findById(followingId);

    // 检查是否已关注
    const existingFollow = await this.followsRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    if (existingFollow) {
      throw BusinessException.conflict('已经关注该用户');
    }

    const follow = this.followsRepository.create({
      follower,
      following,
    });

    const savedFollow = await this.followsRepository.save(follow);

    // 更新用户统计
    await this.updateFollowCounts(followerId, followingId, 1);

    // 发送通知
    await this.notificationsService.create({
      recipientId: followingId,
      senderId: followerId,
      type: NotificationType.FOLLOW,
      title: '新关注',
      content: `${follower.nickname || follower.username} 关注了你`,
    });

    return savedFollow;
  }

  /**
   * 取消关注
   */
  async unfollow(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followsRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    if (!follow) {
      throw BusinessException.notFound('未关注该用户');
    }

    await this.followsRepository.remove(follow);

    // 更新用户统计
    await this.updateFollowCounts(followerId, followingId, -1);
  }

  /**
   * 检查是否已关注
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followsRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    return !!follow;
  }

  /**
   * 获取关注列表
   */
  async getFollowings(userId: string, page: number = 1, pageSize: number = 10) {
    const [follows, total] = await this.followsRepository.findAndCount({
      where: { follower: { id: userId } },
      relations: ['following', 'following.profile'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      items: follows.map((follow) => follow.following),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取粉丝列表
   */
  async getFollowers(userId: string, page: number = 1, pageSize: number = 10) {
    const [follows, total] = await this.followsRepository.findAndCount({
      where: { following: { id: userId } },
      relations: ['follower', 'follower.profile'],
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      items: follows.map((follow) => follow.follower),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 更新关注统计
   */
  private async updateFollowCounts(
    followerId: string,
    followingId: string,
    delta: number,
  ): Promise<void> {
    const followerProfile = await this.usersService.getProfile(followerId);
    const followingProfile = await this.usersService.getProfile(followingId);

    followerProfile.followingCount += delta;
    followingProfile.followerCount += delta;

    await Promise.all([
      this.usersService.updateProfile(followerId, {
        followingCount: followerProfile.followingCount,
      }),
      this.usersService.updateProfile(followingId, {
        followerCount: followingProfile.followerCount,
      }),
    ]);
  }
}
