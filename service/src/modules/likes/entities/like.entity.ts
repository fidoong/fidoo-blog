import { Entity, Column, ManyToOne, Unique, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { Comment } from '@/modules/comments/entities/comment.entity';

export enum LikeType {
  POST = 'post',
  COMMENT = 'comment',
}

/**
 * 点赞实体
 */
@Entity('likes')
@Unique(['user', 'targetType', 'targetId'])
export class Like extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  user: User;

  @Column({ name: 'target_type', type: 'enum', enum: LikeType })
  @Index()
  targetType: LikeType; // 点赞类型：文章或评论

  @Column({ name: 'target_id', length: 36 })
  @Index()
  targetId: string; // 目标ID（文章ID或评论ID）

  // 关联关系（可选，用于快速查询）
  @ManyToOne(() => Post, { nullable: true, onDelete: 'CASCADE' })
  post?: Post;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  comment?: Comment;
}
