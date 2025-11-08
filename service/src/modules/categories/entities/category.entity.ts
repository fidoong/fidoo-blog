import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @Column({ length: 50 })
  @Index()
  name: string;

  @Column({ unique: true, length: 50 })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'parent_id', nullable: true })
  @Index()
  parentId: string | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @Column({ default: 0 })
  level: number; // 0: 大类, 1: 分类

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string | null; // 图标名称或 URL，用于大类显示

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @OneToMany(() => Tag, (tag) => tag.category)
  tags: Tag[];
}
