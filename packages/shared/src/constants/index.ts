/**
 * 共享常量定义
 */

/**
 * HTTP 状态码常量
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 缓存键前缀
 */
export const CACHE_KEYS = {
  POST: 'post',
  POST_LIST: 'post:list',
  USER: 'user',
  CATEGORY: 'category',
  TAG: 'tag',
  COMMENT: 'comment',
} as const;

/**
 * 默认分页参数
 */
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * 缓存过期时间（秒）
 */
export const CACHE_TTL = {
  SHORT: 60, // 1分钟
  MEDIUM: 300, // 5分钟
  LONG: 3600, // 1小时
  DAY: 86400, // 1天
} as const;
