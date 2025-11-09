/**
 * 评论管理 Mutation Hook
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  commentsApi,
  type Comment,
  type CreateCommentDto,
  type UpdateCommentDto,
} from '@/lib/api/comments';
import type { PaginatedResponse } from '@/lib/api/types';

export interface UseCommentsMutationOptions {
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    approve?: string;
    reject?: string;
  };
  errorMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    approve?: string;
    reject?: string;
  };
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  refreshMode?: 'invalidate' | 'refetch';
  onSuccess?: {
    create?: (data: Comment) => void | Promise<void>;
    update?: (data: Comment) => void | Promise<void>;
    delete?: (id: string) => void | Promise<void>;
    approve?: (id: string) => void | Promise<void>;
    reject?: (id: string) => void | Promise<void>;
  };
}

export interface UseCommentsMutationReturn {
  createMutation: ReturnType<typeof useMutation<Comment, Error, CreateCommentDto>>;
  updateMutation: ReturnType<
    typeof useMutation<Comment, Error, { id: string; data: UpdateCommentDto }>
  >;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
  approveMutation: ReturnType<typeof useMutation<void, Error, string>>;
  rejectMutation: ReturnType<typeof useMutation<void, Error, string>>;
  create: (data: CreateCommentDto) => Promise<Comment>;
  update: (id: string, data: UpdateCommentDto) => Promise<Comment>;
  delete: (id: string) => Promise<void>;
  approve: (id: string) => Promise<void>;
  reject: (id: string) => Promise<void>;
}

export function useCommentsMutation(
  options: UseCommentsMutationOptions = {}
): UseCommentsMutationReturn {
  const {
    successMessages = {},
    errorMessages = {},
    showSuccessMessage = true,
    showErrorMessage = true,
    refreshMode = 'refetch',
    onSuccess,
  } = options;

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['comments'], []);

  const refreshData = useCallback(() => {
    if (refreshMode === 'refetch') {
      queryClient.refetchQueries({ queryKey });
    } else {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey, refreshMode]);

  const createMutation = useMutation({
    mutationFn: commentsApi.createComment,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<Comment>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Comment>>(queryKey, {
          ...previousData,
          items: [{ ...newComment, id: 'temp-' + Date.now() } as Comment, ...previousData.items],
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
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentDto }) =>
      commentsApi.updateComment(id, data),
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<Comment>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Comment>>(queryKey, {
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
    mutationFn: commentsApi.deleteComment,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<Comment>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Comment>>(queryKey, {
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

  const approveMutation = useMutation({
    mutationFn: commentsApi.approveComment,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<Comment>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Comment>>(queryKey, {
          ...previousData,
          items: previousData.items.map((item) =>
            item.id === id ? { ...item, status: 'approved' as const } : item
          ),
        });
      }
      return { previousData };
    },
    onSuccess: async (_, id) => {
      if (showSuccessMessage) {
        message.success(successMessages.approve || '审核通过');
      }
      refreshData();
      await onSuccess?.approve?.(id);
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        message.error(errorMessages.approve || error.message || '操作失败');
      }
    },
  });

  const rejectMutation = useMutation({
    mutationFn: commentsApi.rejectComment,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse<Comment>>(queryKey);
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse<Comment>>(queryKey, {
          ...previousData,
          items: previousData.items.map((item) =>
            item.id === id ? { ...item, status: 'rejected' as const } : item
          ),
        });
      }
      return { previousData };
    },
    onSuccess: async (_, id) => {
      if (showSuccessMessage) {
        message.success(successMessages.reject || '已拒绝');
      }
      refreshData();
      await onSuccess?.reject?.(id);
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (showErrorMessage) {
        message.error(errorMessages.reject || error.message || '操作失败');
      }
    },
  });

  const create = useCallback(
    async (data: CreateCommentDto): Promise<Comment> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  const update = useCallback(
    async (id: string, data: UpdateCommentDto): Promise<Comment> => {
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

  const approve = useCallback(
    async (id: string): Promise<void> => {
      return approveMutation.mutateAsync(id);
    },
    [approveMutation]
  );

  const reject = useCallback(
    async (id: string): Promise<void> => {
      return rejectMutation.mutateAsync(id);
    },
    [rejectMutation]
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    approveMutation,
    rejectMutation,
    create,
    update,
    delete: deleteItem,
    approve,
    reject,
  };
}
