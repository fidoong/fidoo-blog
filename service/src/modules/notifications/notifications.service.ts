import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { User } from '@/modules/users/entities/user.entity';
import { QueryDto, PaginationResponseDto } from '@/common/dto';
import { QueryBuilderHelper } from '@/common/helpers';
import { BusinessException } from '@/common';

export interface CreateNotificationDto {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  content?: string;
  targetType?: string;
  targetId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  /**
   * 创建通知
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      recipient: { id: dto.recipientId } as User,
      sender: dto.senderId ? ({ id: dto.senderId } as User) : undefined,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      targetType: dto.targetType,
      targetId: dto.targetId,
      status: NotificationStatus.UNREAD,
    });

    return this.notificationsRepository.save(notification);
  }

  /**
   * 获取用户通知列表
   */
  async getUserNotifications(
    userId: string,
    queryDto: QueryDto,
  ): Promise<PaginationResponseDto<Notification>> {
    const queryBuilder = this.notificationsRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.sender', 'sender')
      .where('notification.recipientId = :userId', { userId });

    // 应用查询条件
    QueryBuilderHelper.applyQuery(
      queryBuilder,
      queryDto,
      ['notification.title', 'notification.content'],
      'notification.createdAt',
    );

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(
      notifications,
      total,
      queryDto.page || 1,
      queryDto.pageSize || 10,
    );
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: {
        recipient: { id: userId },
        status: NotificationStatus.UNREAD,
      },
    });
  }

  /**
   * 标记为已读
   */
  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: {
        id: notificationId,
        recipient: { id: userId },
      },
    });

    if (!notification) {
      throw BusinessException.notFound('通知不存在');
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return this.notificationsRepository.save(notification);
  }

  /**
   * 全部标记为已读
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      {
        recipient: { id: userId },
        status: NotificationStatus.UNREAD,
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );
  }

  /**
   * 删除通知
   */
  async remove(userId: string, notificationId: string): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: {
        id: notificationId,
        recipient: { id: userId },
      },
    });

    if (!notification) {
      throw BusinessException.notFound('通知不存在');
    }

    await this.notificationsRepository.remove(notification);
  }
}
