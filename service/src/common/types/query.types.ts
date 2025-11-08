/**
 * 查询相关类型定义
 */

/**
 * 排序方向
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * 排序配置
 */
export interface SortConfig {
  sortBy?: string;
  sortOrder?: SortOrder;
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/**
 * 查询配置
 */
export interface QueryConfig extends PaginationConfig, SortConfig {
  keyword?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

/**
 * 过滤条件
 */
export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'notIn';
  value: any;
}

/**
 * 查询构建器选项
 */
export interface QueryBuilderOptions {
  filters?: FilterCondition[];
  sorts?: SortConfig[];
  pagination?: PaginationConfig;
  relations?: string[];
  select?: string[];
}
