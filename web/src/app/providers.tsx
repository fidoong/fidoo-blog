'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5分钟 - 增加缓存时间
            gcTime: 10 * 60 * 1000, // 10分钟 - 缓存垃圾回收时间（原cacheTime）
            refetchOnWindowFocus: false,
            refetchOnMount: false, // 组件挂载时不重新获取
            retry: 1, // 失败时重试1次
            retryDelay: 1000, // 重试延迟1秒
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
