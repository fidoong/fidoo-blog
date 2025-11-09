/**
 * 分类管理 Mutation Hook
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  categoriesApi,
  type Category,
  type CreateCategoryDto,
  type UpdateCategoryDto,
} from '@/lib/api/categories';

export interface UseCategoriesMutationOptions {
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
    create?: (data: Category) => void | Promise<void>;
    update?: (data: Category) => void | Promise<void>;
    delete?: (id: string) => void | Promise<void>;
    batchDelete?: (ids: (string | number)[]) => void | Promise<void>;
  };
}

export interface UseCategoriesMutationReturn {
  createMutation: ReturnType<typeof useMutation<Category, Error, CreateCategoryDto>>;
  updateMutation: ReturnType<typeof useMutation<Category, Error, { id: string; data: UpdateCategoryDto }>>;
  deleteMutation: ReturnType<typeof useMutation<void, Error, string>>;
  batchDeleteMutation: ReturnType<typeof useMutation<void, Error, (string | number)[]>>;
  create: (data: CreateCategoryDto) => Promise<Category>;
  update: (id: string, data: UpdateCategoryDto) => Promise<Category>;
  delete: (id: string) => Promise<void>;
  batchDelete: (ids: (string | number)[]) => Promise<void>;
}

export function useCategoriesMutation(
  options: UseCategoriesMutationOptions = {},
): UseCategoriesMutationReturn {
  const {
    successMessages = {},
    errorMessages = {},
    showSuccessMessage = true,
    showErrorMessage = true,
    refreshMode = 'refetch',
    onSuccess,
  } = options;

  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ['categories'], []);

  const refreshData = useCallback(() => {
    if (refreshMode === 'refetch') {
      queryClient.refetchQueries({ queryKey });
    } else {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [queryClient, queryKey, refreshMode]);

  const createMutation = useMutation({
    mutationFn: categoriesApi.createCategory,
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
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      categoriesApi.updateCategory(id, data),
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
    mutationFn: categoriesApi.deleteCategory,
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

  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      await Promise.all(ids.map((id) => categoriesApi.deleteCategory(String(id))));
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
        message.error(errorMessages.batchDelete || error.message || '批量删除失败');
      }
    },
  });

  const create = useCallback(
    async (data: CreateCategoryDto): Promise<Category> => {
      return createMutation.mutateAsync(data);
    },
    [createMutation],
  );

  const update = useCallback(
    async (id: string, data: UpdateCategoryDto): Promise<Category> => {
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

