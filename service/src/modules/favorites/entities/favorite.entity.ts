import { Entity, ManyToOne, Unique, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Post } from '@/modules/posts/entities/post.entity';

/**
 * 收藏实体
 */
@Entity('favorites')
@Unique(['user', 'post'])
export class Favorite extends BaseEntity {
  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @Index()
  user: User;

  @ManyToOne(() => Post, (post) => post.favorites, { onDelete: 'CASCADE' })
  @Index()
  post: Post;
}
