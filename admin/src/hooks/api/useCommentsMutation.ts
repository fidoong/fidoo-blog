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
  updateMutation: ReturnType<typeof useMutation<Comment, Error, { id: string; data: UpdateCommentDto }>>;
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
  options: UseCommentsMutationOptions = {},
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
    onSuccess: async (data) => {
      if (showSuccessMessage) {
        message.success(successMessages.create || '创建成功');
      }
      refreshData();
      await onSuccess?.create?.(data);
    },
    onError: (error: Error) => {
      if (showErrorMessage) {
        message.error(errorMessages.create || error.message || '创建失败');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommentDto }) =>
      commentsApi.updateComment(id, data),
    onSuccess: async (data) => {
      if (showSuccessMessage) {
        message.success(successMessages.update || '更新成功');
      }
      refreshData();
      await onSuccess?.update?.(data);
    },
    onError: (error: Error) => {
      if (showErrorMessage) {
        message.error(errorMessages.update || error.message || '更新失败');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commentsApi.deleteComment,
    onSuccess: async (_, id) => {
      if (showSuccessMessage) {
        message.success(successMessages.delete || '删除成功');
      }
      refreshData();
      await onSuccess?.delete?.(id);
    },
    onError: (error: Error) => {
      if (showErrorMessage) {
        message.error(errorMessages.delete || error.message || '删除失败');
      }
    },
  });

  const approveMutation = useMutation({
    mutationFn: commentsApi.approveComment,
    onSuccess: async (_, id) => {
      if (showSuccessMessage) {
        message.success(successMessages.approve || '审核通过');
      }
      refreshData();
      await onSuccess?.approve?.(id);
    },
    onError: (error: Error) => {
      if (showErrorMessage) {
        message.error(errorMessages.approve || error.message || '操作失败');
      }
    },
  });

  const rejectMutation = useMutation({
    mutationFn: commentsApi.rejectComment,
    onSuccess: async (_, id) => {
      if (showSuccessMessage) {
        message.success(successMessages.reject || '已拒绝');
      }
      refreshData();
      await onSuccess?.reject?.(id);
    },
    onError: (error: Error) => {
      if (showErrorMessage) {
        message.error(errorMessages.reject || error.message || '操作失败');
      }
    },
  });

  const create = useCallback(
    async (data: CreateCommentDto): Promise<Comment> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const update = useCallback(
    async (id: string, data: UpdateCommentDto): Promise<Comment> => {
      return updateMutation.mutateAsync({ id, data });
    },
    [updateMutation],
  );

  const deleteItem = useCallback(
    async (id: string): Promise<void> => {
      return deleteMutation.mutateAsync(id);
    },
    [deleteMutation],
  );

  const approve = useCallback(
    async (id: string): Promise<void> => {
      return approveMutation.mutateAsync(id);
    },
    [approveMutation],
  );

  const reject = useCallback(
    async (id: string): Promise<void> => {
      return rejectMutation.mutateAsync(id);
    },
    [rejectMutation],
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

