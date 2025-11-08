import { Entity, Column, ManyToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { Category } from '@/modules/categories/entities/category.entity';

@Entity('tags')
export class Tag extends BaseEntity {
  @Column({ unique: true, length: 50 })
  @Index()
  name: string;

  @Column({ unique: true, length: 50 })
  @Index()
  slug: string;

  @Column({ nullable: true, length: 7 })
  color: string;

  @Column({ name: 'category_id', nullable: true })
  @Index()
  categoryId: string | null;

  @ManyToOne(() => Category, (category) => category.tags, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}
