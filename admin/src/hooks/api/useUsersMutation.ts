/**
 * 用户管理 Mutation Hook
 * 直接使用 React Query 的 useMutation，提供用户管理的增删改操作
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { usersApi, type User, type CreateUserDto, type UpdateUserDto } from '@/lib/api/users';
import type { PaginatedResponse } from '@/lib/api/types';

/**
 * useUsersMutation 配置
 */
export interface UseUsersMutationOptions {
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
    create?: (data: User) => void | Promise<void>;
    update?: (data: User) => void | Promise<void>;
    delete?: (id: string) => void | Promise<void>;
    batchDelete?: (ids: (string | number)[]) => void | Promise<void>;
  };
}

/**
 * useUsersMutation 返回值
 */
export interface UseUsersMutationReturn {
  /**
   * 创建 Mutation
   */
  createMutation: ReturnType<typeof useMutation<User, Error, CreateUserDto>>;
  /**
   * 更新 Mutation
   */
  updateMutation: ReturnType<typeof useMutation<User, Error, { id: string; data: UpdateUserDto }>>;
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
  create: (data: CreateUserDto) => Promise<User>;
  /**
   * 更新
   */
  update: (id: string, data: UpdateUserDto) => Promise<User>;
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
 * 用户管理 Mutation Hook
 */
export function useUsersMutation(options: UseUsersMutationOptions = {}): UseUsersMutationReturn {
  const {
    successMessages = {},
    errorMessages = {},
    showSuccessMessage = true,
    showErrorMessage = true,
    refreshMode = 'refetch',
    onSuccess,
  } = options;

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['users'], []);

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
    mutationFn: usersApi.createUser,
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<User>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<User>>(queryKey, {
          ...previousData,
          items: [{ ...newUser, id: 'temp-' + Date.now() } as User, ...previousData.items],
          total: previousData.total + 1,
        });
      }
      return { previousData };
    },
    onSuccess: async (data) => {
      if (showSuccessMessage) {
        message.success(successMessages.create || '创建成功');
      }
      refreshData();
      await onSuccess?.create?.(data);
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        const errorMsg = errorMessages.create || error.message || '创建失败';
        message.error(errorMsg);
      }
    },
  });

  // 更新
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.updateUser(id, data),
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<User>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<User>>(queryKey, {
          ...previousData,
          items: previousData.items.map((item) =>
            item.id === id ? { ...item, ...updateData } : item
          ),
        });
      }
      return { previousData };
    },
    onSuccess: async (data) => {
      if (showSuccessMessage) {
        message.success(successMessages.update || '更新成功');
      }
      refreshData();
      await onSuccess?.update?.(data);
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        const errorMsg = errorMessages.update || error.message || '更新失败';
        message.error(errorMsg);
      }
    },
  });

  // 删除
  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<User>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<User>>(queryKey, {
          ...previousData,
          items: previousData.items.filter((item) => item.id !== id),
          total: Math.max(0, previousData.total - 1),
        });
      }
      return { previousData };
    },
    onSuccess: async (_, id) => {
      if (showSuccessMessage) {
        message.success(successMessages.delete || '删除成功');
      }
      refreshData();
      await onSuccess?.delete?.(id);
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        const errorMsg = errorMessages.delete || error.message || '删除失败';
        message.error(errorMsg);
      }
    },
  });

  // 批量删除
  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      await Promise.all(ids.map((id) => usersApi.deleteUser(String(id))));
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<User>>(queryKey);
      if (previousData) {
        const idSet = new Set(ids.map((id) => String(id)));
        queryClient.setQueryData<PaginatedResponse<User>>(queryKey, {
          ...previousData,
          items: previousData.items.filter((item) => !idSet.has(item.id)),
          total: Math.max(0, previousData.total - ids.length),
        });
      }
      return { previousData };
    },
    onSuccess: async (_, ids) => {
      if (showSuccessMessage) {
        message.success(successMessages.batchDelete || '批量删除成功');
      }
      refreshData();
      await onSuccess?.batchDelete?.(ids);
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        const errorMsg = errorMessages.batchDelete || error.message || '批量删除失败';
        message.error(errorMsg);
      }
    },
  });

  // 创建（包装函数）
  const create = useCallback(
    async (data: CreateUserDto): Promise<User> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  // 更新（包装函数）
  const update = useCallback(
    async (id: string, data: UpdateUserDto): Promise<User> => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation]
  );

  // 删除
  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
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
    [batchDeleteMutation]
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
