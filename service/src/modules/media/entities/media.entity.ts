import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

@Entity('media')
export class Media extends BaseEntity {
  @Column({ length: 200 })
  filename: string;

  @Column({ name: 'original_name', length: 200 })
  originalName: string;

  @Column({ type: 'text' })
  path: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  @Index()
  type: MediaType;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @ManyToOne(() => User)
  uploader: User;
}
