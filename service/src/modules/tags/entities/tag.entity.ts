import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { Post } from '@/modules/posts/entities/post.entity';

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

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}
