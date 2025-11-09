import { Entity, Column, OneToMany, OneToOne, Index } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '@/database/base.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { Comment } from '@/modules/comments/entities/comment.entity';
import { Follow } from '@/modules/follows/entities/follow.entity';
import { Like } from '@/modules/likes/entities/like.entity';
import { Favorite } from '@/modules/favorites/entities/favorite.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { UserProfile } from '@/modules/user-profiles/entities/user-profile.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';

export enum UserRoleEnum {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true, length: 50 })
  @Index()
  username: string;

  @Column({ unique: true, length: 100 })
  @Index()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true, length: 50 })
  nickname: string;

  @Column({ nullable: true, type: 'text' })
  avatar: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.USER,
  })
  role: UserRoleEnum; // 保留旧字段以兼容，新系统使用 userRoles 关联

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', length: 50, nullable: true })
  lastLoginIp: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Follow, (follow) => follow.follower)
  followings: Follow[]; // 我关注的人

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[]; // 关注我的人

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications: Notification[];

  @OneToOne(() => UserProfile, (profile) => profile.user)
  profile: UserProfile;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}
