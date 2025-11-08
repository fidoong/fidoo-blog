'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postsApi } from '@/lib/api/posts';
import { PostCard } from './PostCard';
import { PostListSkeleton } from './PostListSkeleton';
import type { PostQueryParams, Post } from '@/lib/api/types';

interface PostListProps {
  params?: PostQueryParams;
}

export function PostList({ params }: PostListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['posts', params],
      queryFn: ({ pageParam = 1 }) =>
        postsApi.getPosts({ ...params, page: pageParam, pageSize: 12 }),
      getNextPageParam: (lastPage) => {
        const pagination = lastPage?.data;
        if (pagination && pagination.hasNext) {
          const nextPage = pagination.page + 1;
          return nextPage;
        }
        return undefined;
      },
      initialPageParam: 1,
    });
  // 合并所有页面的文章
  useEffect(() => {
    if (data?.pages) {
      const posts = data.pages.flatMap((page) => page?.data?.items || []);
      setAllPosts(posts);
    }
  }, [data]);

  // 分离精选文章和普通文章
  const { featuredPosts, normalPosts } = useMemo(() => {
    const featured = allPosts.filter((post) => post.isFeatured);
    const normal = allPosts.filter((post) => !post.isFeatured);
    return { featuredPosts: featured, normalPosts: normal };
  }, [allPosts]);

  // 使用 Intersection Observer 实现无限滚动
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    if (!currentRef) {
      return;
    }

    // 如果已经没有下一页或正在加载，不设置 observer
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !isFetchingRef.current) {
          isFetchingRef.current = true;
          fetchNextPage().finally(() => {
            // 延迟重置，避免快速重复触发
            setTimeout(() => {
              isFetchingRef.current = false;
            }, 500);
          });
        }
      },
      {
        threshold: 0,
        rootMargin: '300px', // 提前300px开始加载
      },
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, allPosts.length]);

  if (error && allPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">加载失败，请稍后重试</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 加载骨架屏 - 仅在初始加载时显示 */}
      {isLoading && allPosts.length === 0 && (
        <div className="animate-in">
          <PostListSkeleton />
        </div>
      )}

      {/* 内容区域 - 使用淡入动画 */}
      {allPosts.length > 0 && (
        <div className="fade-in">
          {/* 精选文章 */}
          {featuredPosts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary-600 rounded-full"></span>
                精选文章
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {featuredPosts.map((post, index) => (
                  <PostCard key={post.id} post={post} featured priority={index === 0} />
                ))}
              </div>
            </div>
          )}

          {/* 普通文章列表 */}
          {normalPosts.length > 0 && (
            <div>
              {featuredPosts.length > 0 && (
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary-600 rounded-full"></span>
                  最新文章
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {normalPosts.map((post, index) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    priority={featuredPosts.length === 0 && index < 3}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 无限滚动触发器 - 必须始终存在以便 Intersection Observer 检测 */}
      {hasNextPage && allPosts.length > 0 && (
        <div
          ref={loadMoreRef}
          className="py-12 min-h-[100px] flex items-center justify-center"
          aria-label="加载更多触发器"
        >
          {isFetchingNextPage ? (
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span>加载更多...</span>
            </div>
          ) : (
            <div className="h-4 w-4" aria-hidden="true">
              {/* 占位元素，确保触发器有足够高度被检测 */}
            </div>
          )}
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && allPosts.length === 0 && (
        <div className="text-center py-16 fade-in">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">暂无文章</p>
        </div>
      )}
    </div>
  );
}
