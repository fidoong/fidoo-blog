/**
 * 统一的 API 响应类型定义
 */

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 标准 API 响应
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  code: number;
  message: string;
  data?: unknown;
  timestamp: string;
}
