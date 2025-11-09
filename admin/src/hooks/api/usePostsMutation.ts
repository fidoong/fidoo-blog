/**
 * 文章管理 Mutation Hook
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { postsApi, type Post, type CreatePostDto, type UpdatePostDto } from '@/lib/api/posts';
import type { PaginatedResponse } from '@/lib/api/types';

export interface UsePostsMutationOptions {
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    batchDelete?: string;
  };
  errorMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    batchDelete?: string;
  };
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  refreshMode?: 'invalidate' | 'refetch';
  onSuccess?: {
    create?: (data: Post) => void | Promise<void>;
    update?: (data: Post) => void | Promise<void>;
    delete?: (id: string) => void | Promise<void>;
    batchDelete?: (ids: (string | number)[]) => void | Promise<void>;
  };
}

export interface UsePostsMutationReturn {
  createMutation: ReturnType<typeof useMutation<Post, Error, CreatePostDto>>;
  updateMutation: ReturnType<typeof useMutation<Post, Error, { id: string; data: UpdatePostDto }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
  batchDeleteMutation: ReturnType<typeof useMutation<void, Error, (string | number)[]>>;
  create: (data: CreatePostDto) => Promise<Post>;
  update: (id: string, data: UpdatePostDto) => Promise<Post>;
  delete: (id: string) => Promise<void>;
  batchDelete: (ids: (string | number)[]) => Promise<void>;
}

export function usePostsMutation(options: UsePostsMutationOptions = {}): UsePostsMutationReturn {
  const {
    successMessages = {},
    errorMessages = {},
    showSuccessMessage = true,
    showErrorMessage = true,
    refreshMode = 'refetch',
    onSuccess,
  } = options;

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['posts'], []);

  const refreshData = useCallback(() => {
    if (refreshMode === 'refetch') {
      queryClient.refetchQueries({ queryKey });
    } else {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey, refreshMode]);

  const createMutation = useMutation({
    mutationFn: postsApi.createPost,
    onMutate: async (newPost) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey });

      // 保存当前数据快照
      const previousData = queryClient.getQueryData<PaginatedResponse<Post>>(queryKey);

      // 乐观更新：在列表开头添加新项
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Post>>(queryKey, {
          ...previousData,
          items: [{ ...newPost, id: 'temp-' + Date.now() } as Post, ...previousData.items],
          total: previousData.total + 1,
        });
      }

      return { previousData };
    },
    onSuccess: async (data) => {
      if (showSuccessMessage) {
        message.success(successMessages.create || '创建成功');
      }
      // 刷新数据以获取服务器返回的完整数据
      refreshData();
      await onSuccess?.create?.(data);
    },
    onError: (error: Error, _variables, context) => {
      // 回滚
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        message.error(errorMessages.create || error.message || '创建失败');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostDto }) =>
      postsApi.updatePost(id, data),
    onMutate: async ({ id, data: updateData }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey });

      // 保存当前数据快照
      const previousData = queryClient.getQueryData<PaginatedResponse<Post>>(queryKey);

      // 乐观更新：更新列表中的对应项
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Post>>(queryKey, {
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
      // 刷新数据以获取服务器返回的完整数据
      refreshData();
      await onSuccess?.update?.(data);
    },
    onError: (error: Error, _variables, context) => {
      // 回滚
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        message.error(errorMessages.update || error.message || '更新失败');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: postsApi.deletePost,
    onMutate: async (id) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey });

      // 保存当前数据快照
      const previousData = queryClient.getQueryData<PaginatedResponse<Post>>(queryKey);

      // 乐观更新：从列表中移除项
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Post>>(queryKey, {
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
      // 刷新数据以确保数据一致性
      refreshData();
      await onSuccess?.delete?.(id);
    },
    onError: (error: Error, _variables, context) => {
      // 回滚
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        message.error(errorMessages.delete || error.message || '删除失败');
      }
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      await Promise.all(ids.map((id) => postsApi.deletePost(String(id))));
    },
    onMutate: async (ids) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey });

      // 保存当前数据快照
      const previousData = queryClient.getQueryData<PaginatedResponse<Post>>(queryKey);

      // 乐观更新：从列表中移除多项
      if (previousData) {
        const idSet = new Set(ids.map((id) => String(id)));
        queryClient.setQueryData<PaginatedResponse<Post>>(queryKey, {
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
      // 刷新数据以确保数据一致性
      refreshData();
      await onSuccess?.batchDelete?.(ids);
    },
    onError: (error: Error, _variables, context) => {
      // 回滚
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        message.error(errorMessages.batchDelete || error.message || '批量删除失败');
      }
    },
  });

  const create = useCallback(
    async (data: CreatePostDto): Promise<Post> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  const update = useCallback(
    async (id: string, data: UpdatePostDto): Promise<Post> => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

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
