/**
 * 审计日志实体
 * 用于记录用户操作和安全事件
 */

import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';

export enum AuditAction {
  // 认证相关
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  TOKEN_REFRESH = 'token_refresh',
  FORCE_LOGOUT = 'force_logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',

  // 设备相关
  DEVICE_CREATE = 'device_create',
  DEVICE_DEACTIVATE = 'device_deactivate',
  DEVICE_DELETE = 'device_delete',

  // 用户操作
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_BAN = 'user_ban',
  USER_UNBAN = 'user_unban',

  // 权限相关
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
  ROLE_ASSIGN = 'role_assign',
  ROLE_REVOKE = 'role_revoke',

  // 内容操作
  POST_CREATE = 'post_create',
  POST_UPDATE = 'post_update',
  POST_DELETE = 'post_delete',
  POST_PUBLISH = 'post_publish',

  // 系统操作
  SETTINGS_UPDATE = 'settings_update',
  CONFIG_UPDATE = 'config_update',
}

export enum AuditStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['action', 'timestamp'])
@Index(['ip', 'timestamp'])
@Index(['status', 'timestamp'])
export class AuditLog extends BaseEntity {
  @Column({ name: 'trace_id', length: 100, nullable: true })
  @Index()
  traceId: string; // 追踪 ID

  @Column({ name: 'user_id', length: 36, nullable: true })
  @Index()
  userId: string; // 用户 ID（匿名操作为 null）

  @Column({ name: 'username', length: 100, nullable: true })
  username: string; // 用户名（用于快速查询）

  @Column({ name: 'action', type: 'enum', enum: AuditAction })
  @Index()
  action: AuditAction; // 操作类型

  @Column({ name: 'resource', length: 100, nullable: true })
  resource: string; // 资源类型（如：User, Post, etc.）

  @Column({ name: 'resource_id', length: 36, nullable: true })
  resourceId: string; // 资源 ID

  @Column({ name: 'ip', length: 50, nullable: true })
  @Index()
  ip: string; // IP 地址

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string; // 用户代理

  @Column({ name: 'device_id', length: 100, nullable: true })
  deviceId: string; // 设备 ID

  @Column({ name: 'method', length: 10, nullable: true })
  method: string; // HTTP 方法

  @Column({ name: 'url', type: 'text', nullable: true })
  url: string; // 请求 URL

  @Column({ name: 'params', type: 'json', nullable: true })
  params: Record<string, unknown>; // 请求参数（已脱敏）

  @Column({ name: 'response', type: 'json', nullable: true })
  response: unknown; // 响应数据（已脱敏）

  @Column({ name: 'status', type: 'enum', enum: AuditStatus })
  @Index()
  status: AuditStatus; // 操作状态

  @Column({ name: 'severity', type: 'enum', enum: AuditSeverity, default: AuditSeverity.LOW })
  severity: AuditSeverity; // 严重程度

  @Column({ name: 'error', type: 'json', nullable: true })
  error: {
    message: string;
    code?: string;
    stack?: string;
  }; // 错误信息

  @Column({ name: 'duration', type: 'int', nullable: true })
  duration: number; // 操作耗时（毫秒）

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata: Record<string, unknown>; // 额外元数据

  @Column({ name: 'is_anomaly', default: false })
  @Index()
  isAnomaly: boolean; // 是否异常操作

  @Column({ name: 'anomaly_reason', type: 'text', nullable: true })
  anomalyReason: string; // 异常原因

  @Column({ name: 'timestamp', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Index()
  timestamp: Date; // 操作时间
}
