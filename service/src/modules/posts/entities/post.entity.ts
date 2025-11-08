import { Entity, Column, ManyToOne, ManyToMany, OneToMany, JoinTable, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { Comment } from '@/modules/comments/entities/comment.entity';
import { Favorite } from '@/modules/favorites/entities/favorite.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('posts')
export class Post extends BaseEntity {
  @Column({ length: 200 })
  @Index()
  title: string;

  @Column({ unique: true, length: 200 })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'cover_image', type: 'text', nullable: true })
  coverImage: string | null;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  @Index()
  status: PostStatus;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @Column({ name: 'favorite_count', default: 0 })
  favoriteCount: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_top', default: false })
  isTop: boolean;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  @Index()
  publishedAt: Date | null;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @ManyToOne(() => Category, (category) => category.posts, { nullable: true })
  category: Category | null;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.post)
  favorites: Favorite[];
}
