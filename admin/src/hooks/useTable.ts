/**
 * 表格相关 Hooks
 * 提供表格的常用功能：分页、搜索、选择、批量操作等
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import type { TablePaginationConfig } from 'antd';

/**
 * 表格分页配置
 */
export interface TablePaginationState {
  current: number;
  pageSize: number;
  total?: number;
}

/**
 * 表格查询参数
 */
export interface TableQueryParams {
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

/**
 * 表格数据响应
 */
export interface TableDataResponse<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * useTable 配置
 */
export interface UseTableOptions<T, Q extends TableQueryParams = TableQueryParams> {
  /**
   * 查询 Key（用于 React Query 缓存）
   */
  queryKey: string[];
  /**
   * 查询函数（接口调用函数）
   * 当查询参数变化时，会自动调用此函数获取数据
   * @param params 查询参数，包含 page, pageSize 和搜索条件
   * @returns 返回表格数据（可以是数组或分页响应对象）
   * @example
   * ```tsx
   * queryFn: async (params) => {
   *   // params = { page: 1, pageSize: 10, username: 'xxx', ... }
   *   return await usersApi.getUsers(params);
   * }
   * ```
   */
  queryFn: (params: Q) => Promise<TableDataResponse<T> | T[]>;
  /**
   * 初始查询参数
   */
  initialParams?: Partial<Q>;
  /**
   * 初始分页配置
   */
  initialPagination?: Partial<TablePaginationState>;
  /**
   * React Query 选项
   */
  queryOptions?: Omit<UseQueryOptions<TableDataResponse<T> | T[]>, 'queryKey' | 'queryFn'>;
  /**
   * 是否自动刷新（默认：true）
   */
  autoRefresh?: boolean;
}

/**
 * useTable 返回值
 */
export interface UseTableReturn<T, Q extends TableQueryParams = TableQueryParams> {
  /**
   * 表格数据
   */
  data: T[];
  /**
   * 总数
   */
  total: number;
  /**
   * 加载状态
   */
  isLoading: boolean;
  /**
   * 错误信息
   */
  error: Error | null;
  /**
   * 分页配置
   */
  pagination: TablePaginationConfig;
  /**
   * 查询参数
   */
  params: Q;
  /**
   * 设置查询参数
   */
  setParams: (params: Partial<Q> | ((prev: Q) => Q)) => void;
  /**
   * 重置查询参数
   */
  resetParams: () => void;
  /**
   * 刷新数据
   */
  refresh: () => void;
  /**
   * 重置分页
   */
  resetPagination: () => void;
}

/**
 * 表格基础 Hook
 * 提供分页、搜索、数据加载等功能
 *
 * 工作原理：
 * 1. 使用 React Query 的 useQuery 进行数据获取和缓存
 * 2. 当 queryParams（搜索参数 + 分页参数）变化时，自动调用 queryFn 获取数据
 * 3. queryFn 是用户传入的接口调用函数（如 usersApi.getUsers）
 * 4. 自动处理加载状态、错误状态、数据格式化等
 *
 * @example
 * ```tsx
 * const table = useTable({
 *   queryKey: ['users'],
 *   queryFn: async (params) => {
 *     // params 包含：{ page: 1, pageSize: 10, username: 'xxx', ... }
 *     // 这里就是实际的接口调用
 *     return await usersApi.getUsers(params);
 *   },
 * });
 * ```
 */
export function useTable<T, Q extends TableQueryParams = TableQueryParams>(
  options: UseTableOptions<T, Q>
): UseTableReturn<T, Q> {
  const {
    queryKey,
    queryFn,
    initialParams = {},
    initialPagination = {},
    queryOptions = {},
  } = options;

  const [pagination, setPagination] = useState<TablePaginationState>({
    current: initialPagination.current || 1,
    pageSize: initialPagination.pageSize || 10,
    total: initialPagination.total,
  });

  const [params, setParamsState] = useState<Q>(
    () =>
      ({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...initialParams,
      }) as Q
  );

  const queryClient = useQueryClient();

  // 构建查询参数（合并搜索参数和分页参数）
  const queryParams = useMemo(
    () => ({
      ...params,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params, pagination.current, pagination.pageSize]
  );

  // 数据查询：使用 React Query 的 useQuery
  // 当 queryParams 变化时，会自动调用 queryFn(queryParams) 来获取数据
  // queryFn 就是用户传入的接口调用函数（如 usersApi.getUsers）
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, queryParams], // 查询 key，用于缓存和刷新
    queryFn: () => queryFn(queryParams), // 查询函数，实际调用接口的地方
    ...queryOptions,
  });

  // 格式化数据
  const { items, total } = useMemo(() => {
    if (Array.isArray(data)) {
      return {
        items: data,
        total: data.length,
      };
    }
    return {
      items: data?.items || [],
      total: data?.total || 0,
    };
  }, [data]);

  // 设置查询参数
  const setParams = useCallback((newParams: Partial<Q> | ((prev: Q) => Q)) => {
    setParamsState((prev) => {
      const updated = typeof newParams === 'function' ? newParams(prev) : { ...prev, ...newParams };
      // 重置到第一页
      setPagination((p) => ({ ...p, current: 1 }));
      return updated;
    });
  }, []);

  // 重置查询参数
  const resetParams = useCallback(() => {
    setParamsState(
      () =>
        ({
          page: 1,
          pageSize: pagination.pageSize,
          ...initialParams,
        }) as Q
    );
    setPagination((p) => ({ ...p, current: 1 }));
  }, [initialParams, pagination.pageSize]);

  // 刷新数据
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // 重置分页
  const resetPagination = useCallback(() => {
    setPagination((p) => ({ ...p, current: 1 }));
  }, []);

  // Ant Design 分页配置
  const antdPagination: TablePaginationConfig = useMemo(
    () => ({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total ?? total,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
      onChange: (page, size) => {
        setPagination((p) => ({
          ...p,
          current: page,
          pageSize: size || p.pageSize,
        }));
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.current, pagination.pageSize, pagination.total, total]
  );

  // 更新总数
  if (pagination.total !== total) {
    setPagination((p) => ({ ...p, total }));
  }

  return {
    data: items,
    total,
    isLoading,
    error: error as Error | null,
    pagination: antdPagination,
    params: queryParams,
    setParams,
    resetParams,
    refresh,
    resetPagination,
  };
}
