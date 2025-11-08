import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { Post } from '@/modules/posts/entities/post.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ unique: true, length: 50 })
  @Index()
  name: string;

  @Column({ unique: true, length: 50 })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];
}
