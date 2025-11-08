import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * 预取 Hook - 用于预加载路由和数据
 */
export function usePrefetch() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const prefetchRoute = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router],
  );

  const prefetchQuery = useCallback(
    <T>(queryKey: unknown[], queryFn: () => Promise<T>) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
      });
    },
    [queryClient],
  );

  return { prefetchRoute, prefetchQuery };
}
