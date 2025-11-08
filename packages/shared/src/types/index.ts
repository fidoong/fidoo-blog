/**
 * 共享类型定义
 * 前后端通用类型，确保类型一致性
 */

// ==================== 基础类型 ====================

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: string;
  createdAt: string; // ISO 8601 格式的日期字符串
  updatedAt: string; // ISO 8601 格式的日期字符串
}

// ==================== 枚举类型 ====================

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

/**
 * 文章状态枚举
 */
export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * 评论状态枚举
 */
export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * 点赞类型枚举
 */
export enum LikeType {
  POST = 'post',
  COMMENT = 'comment',
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  REPLY = 'reply',
  FOLLOW = 'follow',
  MENTION = 'mention',
  SYSTEM = 'system',
}

/**
 * 通知状态枚举
 */
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

/**
 * 业务错误码枚举
 */
export enum ResponseCode {
  SUCCESS = 0,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500,
}

// ==================== API 类型 ====================

/**
 * API 统一响应格式
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 分页响应类型
 */
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number; // 兼容旧参数名
}

/**
 * 查询参数（通用）
 */
export interface QueryParams extends PaginationParams {
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
}

// ==================== 工具类型 ====================

/**
 * 创建类型（排除 id, createdAt, updatedAt）
 */
export type CreateInput<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 更新类型（所有字段可选，排除 id, createdAt, updatedAt）
 */
export type UpdateInput<T extends BaseEntity> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
