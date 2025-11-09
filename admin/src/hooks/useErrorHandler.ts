/**
 * 错误处理 Hook
 * 提供统一的错误处理功能
 */

import { useCallback } from 'react';
import { message } from 'antd';

interface ApiError {
  code?: number;
  message?: string;
  data?: unknown;
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    if (apiError.message) {
      return apiError.message;
    }
    if (apiError.code) {
      return `错误代码: ${apiError.code}`;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '操作失败，请稍后重试';
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage = customMessage || getErrorMessage(error);
    message.error(errorMessage);
    console.error('Error:', error);
  }, []);

  const handleSuccess = useCallback((msg: string = '操作成功') => {
    message.success(msg);
  }, []);

  const handleWarning = useCallback((msg: string) => {
    message.warning(msg);
  }, []);

  const handleInfo = useCallback((msg: string) => {
    message.info(msg);
  }, []);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}
