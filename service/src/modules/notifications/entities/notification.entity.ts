import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum NotificationType {
  LIKE = 'like', // 点赞
  COMMENT = 'comment', // 评论
  REPLY = 'reply', // 回复
  FOLLOW = 'follow', // 关注
  MENTION = 'mention', // 提及
  SYSTEM = 'system', // 系统通知
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

/**
 * 通知实体
 */
@Entity('notifications')
export class Notification extends BaseEntity {
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @Index()
  recipient: User; // 接收者

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  sender?: User; // 发送者（系统通知可能没有发送者）

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  @Index()
  type: NotificationType;

  @Column({ type: 'text' })
  title: string; // 通知标题

  @Column({ type: 'text', nullable: true })
  content: string; // 通知内容

  @Column({ name: 'target_type', length: 50, nullable: true })
  targetType?: string; // 目标类型（post, comment等）

  @Column({ name: 'target_id', length: 36, nullable: true })
  @Index()
  targetId?: string; // 目标ID

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  @Index()
  status: NotificationStatus;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date; // 阅读时间
}
