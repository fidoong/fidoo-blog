/**
 * 错误提示组件
 * 用于显示友好的错误消息
 */

'use client';

import { Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ErrorAlertProps {
  error: Error | unknown;
  onRetry?: () => void;
  title?: string;
  closable?: boolean;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  if (typeof error === 'string') {
    return error;
  }
  return '发生了未知错误';
}

export function ErrorAlert({
  error,
  onRetry,
  title = '操作失败',
  closable = true,
}: ErrorAlertProps) {
  const errorMessage = getErrorMessage(error);

  return (
    <Alert
      message={title}
      description={errorMessage}
      type="error"
      showIcon
      action={
        onRetry && (
          <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
            重试
          </Button>
        )
      }
      closable={closable}
    />
  );
}
