import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { User } from '@/modules/users/entities/user.entity';

/**
 * 用户扩展信息实体
 */
@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 0 })
  points: number; // 积分

  @Column({ default: 1 })
  level: number; // 等级

  @Column({ name: 'article_count', default: 0 })
  articleCount: number; // 文章数

  @Column({ name: 'follower_count', default: 0 })
  followerCount: number; // 粉丝数

  @Column({ name: 'following_count', default: 0 })
  followingCount: number; // 关注数

  @Column({ name: 'like_count', default: 0 })
  likeCount: number; // 获赞数

  @Column({ name: 'favorite_count', default: 0 })
  favoriteCount: number; // 收藏数

  @Column({ name: 'view_count', default: 0 })
  viewCount: number; // 总阅读数

  @Column({ type: 'text', nullable: true })
  location: string; // 位置

  @Column({ type: 'text', nullable: true })
  company: string; // 公司

  @Column({ type: 'text', nullable: true })
  website: string; // 网站

  @Column({ type: 'text', nullable: true })
  github: string; // GitHub

  @Column({ type: 'text', nullable: true })
  twitter: string; // Twitter

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean; // 是否认证
}
