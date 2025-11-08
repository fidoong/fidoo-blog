'use client';

import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postsApi } from '@/lib/api/posts';
import { PostCompactCard } from './PostCompactCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';
import type { PostQueryParams } from '@/lib/api/types';
import { useIntersection } from '@/hooks/useIntersection';

interface PostCompactListProps {
  params?: PostQueryParams;
}

export function PostCompactList({ params }: PostCompactListProps) {
  const { ref: loadMoreRef, inView } = useIntersection({ threshold: 0.1 });

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['posts', params],
      queryFn: ({ pageParam = 1 }) =>
        postsApi.getPosts({ ...params, page: pageParam, pageSize: 20 }),
      getNextPageParam: (lastPage) => {
        const pagination = lastPage?.data;
        if (pagination && pagination.hasNext) {
          return pagination.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
    });

  // 合并所有页面的文章
  const allPosts = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data?.items || []) || [];
  }, [data]);

  // 分离置顶、精选和普通文章
  const { topPosts, featuredPosts, normalPosts } = useMemo(() => {
    const top = allPosts.filter((post) => post.isTop);
    const featured = allPosts.filter((post) => post.isFeatured && !post.isTop);
    const normal = allPosts.filter((post) => !post.isFeatured && !post.isTop);
    return { topPosts: top, featuredPosts: featured, normalPosts: normal };
  }, [allPosts]);

  // 自动加载更多
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (isLoading && allPosts.length === 0) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-white border-b border-gray-100 p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-32 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && allPosts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="加载失败"
        description="无法加载文章列表，请稍后重试"
        action={{
          label: '重试',
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  if (allPosts.length === 0) {
    return <EmptyState icon={FileText} title="暂无文章" description="该分类下还没有发布任何文章" />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* 置顶文章 */}
      {topPosts.length > 0 && (
        <div className="border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          {topPosts.map((post, index) => (
            <PostCompactCard key={post.id} post={post} priority={index === 0} />
          ))}
        </div>
      )}

      {/* 精选文章 */}
      {featuredPosts.length > 0 && (
        <div className="border-b border-gray-200 bg-gradient-to-r from-primary-50/50 to-blue-50/50">
          {featuredPosts.map((post, index) => (
            <PostCompactCard
              key={post.id}
              post={post}
              priority={index === 0 && topPosts.length === 0}
            />
          ))}
        </div>
      )}

      {/* 普通文章列表 */}
      <div>
        {normalPosts.map((post, index) => (
          <PostCompactCard
            key={post.id}
            post={post}
            priority={index < 3 && topPosts.length === 0 && featuredPosts.length === 0}
          />
        ))}
      </div>

      {/* 加载更多触发器 */}
      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="py-6 flex items-center justify-center border-t border-gray-100"
        >
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span>加载更多...</span>
            </div>
          ) : (
            <div className="h-1 w-1" aria-hidden="true" />
          )}
        </div>
      )}

      {/* 没有更多提示 */}
      {!hasNextPage && allPosts.length > 0 && (
        <div className="py-6 text-center text-sm text-gray-400 border-t border-gray-100">
          已显示全部文章
        </div>
      )}
    </div>
  );
}
