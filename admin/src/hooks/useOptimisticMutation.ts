/**
 * 乐观更新 Mutation Hook
 * 在数据更新时立即更新 UI，如果失败则回滚
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { message } from 'antd';

interface OptimisticMutationOptions<TData, TVariables, TError = Error> {
  queryKey: string[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown;
  onError?: (error: TError, variables: TVariables, context: unknown) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: boolean;
}

/**
 * 乐观更新 Mutation Hook
 *
 * @example
 * ```tsx
 * const updateMutation = useOptimisticMutation({
 *   queryKey: ['users'],
 *   mutationFn: (data) => usersApi.updateUser(id, data),
 *   onMutate: async (newData) => {
 *     // 取消正在进行的查询
 *     await queryClient.cancelQueries({ queryKey: ['users'] });
 *     // 保存当前数据快照
 *     const previousData = queryClient.getQueryData(['users']);
 *     // 乐观更新
 *     queryClient.setQueryData(['users'], (old: any) => ({
 *       ...old,
 *       items: old.items.map((item: User) => item.id === id ? { ...item, ...newData } : item)
 *     }));
 *     return { previousData };
 *   },
 *   successMessage: '更新成功',
 * });
 * ```
 */
export function useOptimisticMutation<TData, TVariables, TError = Error>({
  queryKey,
  mutationFn,
  onMutate,
  onError,
  onSuccess,
  successMessage,
  errorMessage,
  invalidateQueries = true,
}: OptimisticMutationOptions<TData, TVariables, TError>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey });

      // 保存当前数据快照
      const previousData = queryClient.getQueryData(queryKey);

      // 乐观更新
      if (onMutate) {
        const optimisticUpdate = await onMutate(variables);
        if (optimisticUpdate !== undefined) {
          queryClient.setQueryData(queryKey, optimisticUpdate);
        }
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // 回滚
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      const msg = errorMessage || '操作失败，请稍后重试';
      message.error(msg);
      onError?.(error, variables, context);
    },
    onSuccess: (data, variables) => {
      if (successMessage) {
        message.success(successMessage);
      }
      if (invalidateQueries) {
        queryClient.invalidateQueries({ queryKey });
      }
      onSuccess?.(data, variables);
    },
  } as UseMutationOptions<TData, TError, TVariables, unknown>);
}
