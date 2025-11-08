import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { Like } from '@/modules/likes/entities/like.entity';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('comments')
export class Comment extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PENDING,
  })
  @Index()
  status: CommentStatus;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  @Index()
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.children, { nullable: true })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];
}
