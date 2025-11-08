import { Entity, ManyToOne, Unique, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { User } from '@/modules/users/entities/user.entity';

/**
 * 关注关系实体
 */
@Entity('follows')
@Unique(['follower', 'following'])
export class Follow extends BaseEntity {
  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  @Index()
  follower: User; // 关注者

  @ManyToOne(() => User, (user) => user.followings, { onDelete: 'CASCADE' })
  @Index()
  following: User; // 被关注者
}
