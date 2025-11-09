/**
 * 标签管理 Mutation Hook
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { tagsApi, type Tag, type CreateTagDto, type UpdateTagDto } from '@/lib/api/tags';
import type { PaginatedResponse } from '@/lib/api/types';

export interface UseTagsMutationOptions {
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
    create?: (data: Tag) => void | Promise<void>;
    update?: (data: Tag) => void | Promise<void>;
    delete?: (id: string) => void | Promise<void>;
    batchDelete?: (ids: (string | number)[]) => void | Promise<void>;
  };
}

export interface UseTagsMutationReturn {
  createMutation: ReturnType<typeof useMutation<Tag, Error, CreateTagDto>>;
  updateMutation: ReturnType<typeof useMutation<Tag, Error, { id: string; data: UpdateTagDto }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
  batchDeleteMutation: ReturnType<typeof useMutation<void, Error, (string | number)[]>>;
  create: (data: CreateTagDto) => Promise<Tag>;
  update: (id: string, data: UpdateTagDto) => Promise<Tag>;
  delete: (id: string) => Promise<void>;
  batchDelete: (ids: (string | number)[]) => Promise<void>;
}

export function useTagsMutation(options: UseTagsMutationOptions = {}): UseTagsMutationReturn {
  const {
    successMessages = {},
    errorMessages = {},
    showSuccessMessage = true,
    showErrorMessage = true,
    refreshMode = 'refetch',
    onSuccess,
  } = options;

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['tags'], []);

  const refreshData = useCallback(() => {
    if (refreshMode === 'refetch') {
      queryClient.refetchQueries({ queryKey });
    } else {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey, refreshMode]);

  const createMutation = useMutation({
    mutationFn: tagsApi.createTag,
    onMutate: async (newTag) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<Tag>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Tag>>(queryKey, {
          ...previousData,
          items: [{ ...newTag, id: 'temp-' + Date.now() } as Tag, ...previousData.items],
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
        message.error(errorMessages.create || error.message || '创建失败');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagDto }) => tagsApi.updateTag(id, data),
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<Tag>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Tag>>(queryKey, {
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
        message.error(errorMessages.update || error.message || '更新失败');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tagsApi.deleteTag,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<Tag>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Tag>>(queryKey, {
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
        message.error(errorMessages.delete || error.message || '删除失败');
      }
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      await Promise.all(ids.map((id) => tagsApi.deleteTag(String(id))));
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<Tag>>(queryKey);
      if (previousData) {
        const idSet = new Set(ids.map((id) => String(id)));
        queryClient.setQueryData<PaginatedResponse<Tag>>(queryKey, {
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
        message.error(errorMessages.batchDelete || error.message || '批量删除失败');
      }
    },
  });

  const create = useCallback(
    async (data: CreateTagDto): Promise<Tag> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  const update = useCallback(
    async (id: string, data: UpdateTagDto): Promise<Tag> => {
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
