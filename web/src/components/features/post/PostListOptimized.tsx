'use client';

import { useMemo, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postsApi } from '@/lib/api/posts';
import { PostCardOptimized } from './PostCardOptimized';
import { Loading } from '@/components/shared/Loading';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';
import type { PostQueryParams } from '@/lib/api/types';
import { useIntersection } from '@/hooks/useIntersection';

interface PostListOptimizedProps {
  params?: PostQueryParams;
}

export function PostListOptimized({ params }: PostListOptimizedProps) {
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

  // 分离精选文章和普通文章
  const { featuredPosts, normalPosts } = useMemo(() => {
    const featured = allPosts.filter((post) => post.isFeatured);
    const normal = allPosts.filter((post) => !post.isFeatured);
    return { featuredPosts: featured, normalPosts: normal };
  }, [allPosts]);

  // 自动加载更多
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <Loading variant="list" />;
  }

  if (error) {
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
    return <EmptyState icon={FileText} title="暂无文章" description="还没有发布任何文章" />;
  }

  return (
    <div className="space-y-8">
      {/* 精选文章 */}
      {featuredPosts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary-600 rounded-full"></span>
            精选文章
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post, index) => (
              <PostCardOptimized key={post.id} post={post} featured priority={index === 0} />
            ))}
          </div>
        </div>
      )}

      {/* 普通文章列表 */}
      {normalPosts.length > 0 && (
        <div>
          {featuredPosts.length > 0 && (
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-600 rounded-full"></span>
              最新文章
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalPosts.map((post, index) => (
              <PostCardOptimized key={post.id} post={post} priority={index < 3} />
            ))}
          </div>
        </div>
      )}

      {/* 加载更多触发器 */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isFetchingNextPage && <Loading variant="default" />}
        </div>
      )}
    </div>
  );
}
