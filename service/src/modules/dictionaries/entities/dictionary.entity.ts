import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';

export enum DictionaryType {
  TREE = 'tree', // 树形结构
  DICT = 'dict', // 字典类型
}

export enum DictionaryStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
}

@Entity('dictionaries')
@Index(['parentId', 'sortOrder'])
@Index(['code', 'type'])
@Index(['code', 'value'], { unique: true })
export class Dictionary extends BaseEntity {
  @Column({ length: 100 })
  name: string; // 字典名称

  @Column({ length: 100 })
  @Index()
  code: string; // 字典编码（同一code下可以有多个值）

  @Column({ type: 'enum', enum: DictionaryType, default: DictionaryType.DICT })
  type: DictionaryType; // 字典类型：tree 或 dict

  @Column({ name: 'parent_id', nullable: true })
  parentId: string | null; // 父字典ID（用于树形结构）

  @ManyToOne(() => Dictionary, (dict) => dict.children, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Dictionary | null;

  @OneToMany(() => Dictionary, (dict) => dict.parent)
  children: Dictionary[];

  @Column({ type: 'varchar', length: 200, nullable: true })
  label: string | null; // 显示标签

  @Column({ type: 'varchar', length: 200, nullable: true })
  value: string | null; // 字典值

  @Column({ type: 'jsonb', nullable: true })
  extra: Record<string, any> | null; // 扩展字段（JSON格式）

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number; // 排序

  @Column({ type: 'enum', enum: DictionaryStatus, default: DictionaryStatus.ENABLED })
  status: DictionaryStatus; // 状态

  @Column({ type: 'text', nullable: true })
  description: string | null; // 描述

  @Column({ name: 'is_system', default: false })
  isSystem: boolean; // 是否系统字典（系统字典不可删除）
}

