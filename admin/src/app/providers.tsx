/**
 * 全局 Providers
 */

'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 创建QueryClient实例，使用单例模式避免重复创建
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 性能优化：减少不必要的重新获取
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        // 重试策略：快速失败，避免长时间等待
        retry: (failureCount, error: any) => {
          // 4xx错误不重试
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 缓存时间：平衡数据新鲜度和性能
        staleTime: 5 * 60 * 1000, // 5 分钟
        gcTime: 10 * 60 * 1000, // 10 分钟（原cacheTime）
        // 网络模式：优化离线体验
        networkMode: 'online',
      },
      mutations: {
        // 错误重试
        retry: 1,
        retryDelay: 1000,
        // 网络模式
        networkMode: 'online',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // 服务端：总是创建新的实例
    return makeQueryClient();
  } else {
    // 客户端：使用单例模式
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  // 使用单例QueryClient，避免在开发模式下重复创建
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
          errorTypes={[
            {
              name: 'Network Error',
              initialIsOpen: true,
            },
          ]}
        />
      )}
    </QueryClientProvider>
  );
}
