/**
 * 权限管理 Mutation Hook
 * 直接使用 React Query 的 useMutation，提供权限管理的增删改操作
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  permissionsApi,
  type Permission,
  type CreatePermissionDto,
  type UpdatePermissionDto,
} from '@/lib/api/permissions';

/**
 * usePermissionsMutation 配置
 */
export interface UsePermissionsMutationOptions {
  /**
   * 成功提示文本
   */
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    batchDelete?: string;
  };
  /**
   * 失败提示文本
   */
  errorMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    batchDelete?: string;
  };
  /**
   * 是否显示成功提示（默认：true）
   */
  showSuccessMessage?: boolean;
  /**
   * 是否显示失败提示（默认：true）
   */
  showErrorMessage?: boolean;
  /**
   * 刷新模式（默认：'refetch' 立即刷新）
   */
  refreshMode?: 'invalidate' | 'refetch';
  /**
   * 操作成功后的回调
   */
  onSuccess?: {
    create?: (data: Permission) => void | Promise<void>;
    update?: (data: Permission) => void | Promise<void>;
    delete?: (id: string) => void | Promise<void>;
    batchDelete?: (ids: (string | number)[]) => void | Promise<void>;
  };
}

/**
 * usePermissionsMutation 返回值
 */
export interface UsePermissionsMutationReturn {
  /**
   * 创建 Mutation
   */
  createMutation: ReturnType<typeof useMutation<Permission, Error, CreatePermissionDto>>;
  /**
   * 更新 Mutation
   */
  updateMutation: ReturnType<typeof useMutation<Permission, Error, { id: string; data: UpdatePermissionDto }>>;
  /**
   * 删除 Mutation
   */
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
  /**
   * 批量删除 Mutation
   */
  batchDeleteMutation: ReturnType<typeof useMutation<void, Error, (string | number)[]>>;
  /**
   * 创建
   */
  create: (data: CreatePermissionDto) => Promise<Permission>;
  /**
   * 更新
   */
  update: (id: string, data: UpdatePermissionDto) => Promise<Permission>;
  /**
   * 删除
   */
  delete: (id: string) => Promise<void>;
  /**
   * 批量删除
   */
  batchDelete: (ids: (string | number)[]) => Promise<void>;
}

/**
 * 权限管理 Mutation Hook
 */
export function usePermissionsMutation(
  options: UsePermissionsMutationOptions = {},
): UsePermissionsMutationReturn {
  const {
    successMessages = {},
    errorMessages = {},
    showSuccessMessage = true,
    showErrorMessage = true,
    refreshMode = 'refetch',
    onSuccess,
  } = options;

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['permissions'], []);

  // 刷新数据的统一方法
  const refreshData = useCallback(() => {
    if (refreshMode === 'refetch') {
      queryClient.refetchQueries({ queryKey });
    } else {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey, refreshMode]);

  // 创建
  const createMutation = useMutation({
    mutationFn: permissionsApi.createPermission,
    onSuccess: async (data) => {
      if (showSuccessMessage) {
        message.success(successMessages.create || '创建成功');
      }
      refreshData();
      await onSuccess?.create?.(data);
    },
    onError: (error: Error) => {
      if (showErrorMessage) {
        const errorMsg = errorMessages.create || error.message || '创建失败';
        message.error(errorMsg);
      }
    },
  });

  // 更新
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionDto }) =>
      permissionsApi.updatePermission(id, data),
    onSuccess: async (data) => {
      if (showSuccessMessage) {
        message.success(successMessages.update || '更新成功');
      }
      refreshData();
      await onSuccess?.update?.(data);
    },
    onError: (error: Error) => {
      if (showErrorMessage) {
        const errorMsg = errorMessages.update || error.message || '更新失败';
        message.error(errorMsg);
      }
    },
  });

  // 删除
  const deleteMutation = useMutation({
    mutationFn: permissionsApi.deletePermission,
    onSuccess: async (_, id) => {
      if (showSuccessMessage) {
        message.success(successMessages.delete || '删除成功');
      }
      refreshData();
      await onSuccess?.delete?.(id);
    },
    onError: (error: Error) => {
      if (showErrorMessage) {
        const errorMsg = errorMessages.delete || error.message || '删除失败';
        message.error(errorMsg);
      }
    },
  });

  // 批量删除
  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      await Promise.all(ids.map((id) => permissionsApi.deletePermission(String(id))));
    },
    onSuccess: async (_, ids) => {
      if (showSuccessMessage) {
        message.success(successMessages.batchDelete || '批量删除成功');
      }
      refreshData();
      await onSuccess?.batchDelete?.(ids);
    },
    onError: (error: Error) => {
      if (showErrorMessage) {
        const errorMsg = errorMessages.batchDelete || error.message || '批量删除失败';
        message.error(errorMsg);
      }
    },
  });

  // 创建（包装函数）
  const create = useCallback(
    async (data: CreatePermissionDto): Promise<Permission> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  // 更新（包装函数）
  const update = useCallback(
    async (id: string, data: UpdatePermissionDto): Promise<Permission> => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation],
  );

  // 删除
  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  // 批量删除
  const batchDelete = useCallback(
    async (ids: (string | number)[]): Promise<void> => {
      if (ids.length === 0) {
        message.warning('请选择要删除的数据');
        return;
      }
      return batchDeleteMutation.mutateAsync(ids);
    },
    [batchDeleteMutation],
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    batchDeleteMutation,
    create,
    update,
    delete: deleteItem,
    batchDelete,
  };
}
