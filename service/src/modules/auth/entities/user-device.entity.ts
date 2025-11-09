/**
 * 用户设备实体
 * 用于跟踪用户的登录设备
 */

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';
import { User } from '@/modules/users/entities/user.entity';

@Entity('user_devices')
@Index(['userId', 'deviceId'], { unique: true })
export class UserDevice extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'device_id', length: 100 })
  @Index()
  deviceId: string; // 设备唯一标识（如：浏览器指纹、设备 UUID）

  @Column({ name: 'device_name', length: 200, nullable: true })
  deviceName: string; // 设备名称（如：Chrome on Windows）

  @Column({ name: 'device_type', length: 50, nullable: true })
  deviceType: string; // 设备类型（如：desktop, mobile, tablet）

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string; // 用户代理字符串

  @Column({ name: 'ip_address', length: 50, nullable: true })
  @Index()
  ipAddress: string; // IP 地址

  @Column({ name: 'last_active_at', type: 'timestamp', nullable: true })
  lastActiveAt: Date; // 最后活跃时间

  @Column({ name: 'is_active', default: true })
  isActive: boolean; // 是否活跃

  @Column({ name: 'is_trusted', default: false })
  isTrusted: boolean; // 是否信任设备（免密登录等）

  @Column({ name: 'login_count', default: 0 })
  loginCount: number; // 登录次数

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date; // 最后登录时间
}
