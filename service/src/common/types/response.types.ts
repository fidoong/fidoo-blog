/**
 * 响应相关类型定义
 */

/**
 * 成功响应类型
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * 错误响应类型
 */
export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: any;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * 统一响应类型
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
