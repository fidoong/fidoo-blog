'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { postsApi } from '@/lib/api/posts';
import { likesApi } from '@/lib/api/likes';
import { favoritesApi } from '@/lib/api/favorites';
import { useAuthStore } from '@/store/auth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import Image from 'next/image';
import { Calendar, Eye, Heart, MessageCircle, User, Bookmark } from 'lucide-react';
import { formatRelativeTime, formatNumber } from '@/lib/utils/format';
import Link from 'next/link';

// 动态导入重组件，实现代码分割
const PostContent = dynamic(
  () => import('@/components/post/PostContent').then((mod) => ({ default: mod.PostContent })),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    ),
    ssr: true,
  },
);

const PostComments = dynamic(
  () => import('@/components/post/PostComments').then((mod) => ({ default: mod.PostComments })),
  {
    loading: () => (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6" />
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ),
    ssr: false, // 评论组件不需要SSR
  },
);

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  // 安全地处理 params，可能是 Promise 或已解析的对象
  // 在客户端组件中，params 可能已经被解析
  let slug: string;
  if (
    params &&
    typeof params === 'object' &&
    'then' in params &&
    typeof params.then === 'function'
  ) {
    // 是 Promise
    slug = use(params as Promise<{ slug: string }>).slug;
  } else {
    // 已经是解析后的对象
    slug = (params as { slug: string }).slug;
  }
  const hasIncremented = useRef(false);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getPostBySlug(slug),
    enabled: !!slug,
  });

  const post = data?.data;

  // 检查点赞状态
  const { data: likeCheckData } = useQuery({
    queryKey: ['like-check', post?.id],
    queryFn: () => {
      if (!post?.id) throw new Error('Post ID not found');
      return likesApi.checkLike('post', post.id);
    },
    enabled: !!post?.id && isAuthenticated,
    retry: (failureCount, error: unknown) => {
      // 如果是 401 错误，不重试
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });

  // 检查收藏状态
  const { data: favoriteCheckData } = useQuery({
    queryKey: ['favorite-check', post?.id],
    queryFn: () => {
      if (!post?.id) throw new Error('Post ID not found');
      return favoritesApi.checkFavorite(post.id);
    },
    enabled: !!post?.id && isAuthenticated,
    retry: (failureCount, error: unknown) => {
      // 如果是 401 错误，不重试
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });

  // 初始化状态
  useEffect(() => {
    if (post) {
      setLikeCount(post.likeCount);
    }
    if (likeCheckData?.data) {
      setIsLiked(likeCheckData.data.isLiked);
    }
    if (favoriteCheckData?.data) {
      setIsFavorited(favoriteCheckData.data.isFavorited);
    }
  }, [post, likeCheckData, favoriteCheckData]);

  // 点赞 mutation
  const likeMutation = useMutation({
    mutationFn: () => {
      if (!post) throw new Error('Post not found');
      return isLiked ? likesApi.unlike('post', post.id) : likesApi.like('post', post.id);
    },
    onSuccess: (response) => {
      const newIsLiked = response.data?.isLiked ?? !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount((prev) => (newIsLiked ? prev + 1 : Math.max(0, prev - 1)));
      queryClient.invalidateQueries({ queryKey: ['post', slug] });
    },
  });

  // 收藏 mutation
  const favoriteMutation = useMutation({
    mutationFn: () => {
      if (!post) throw new Error('Post not found');
      return isFavorited ? favoritesApi.unfavorite(post.id) : favoritesApi.favorite(post.id);
    },
    onSuccess: (response) => {
      const newIsFavorited = response.data?.isFavorited ?? !isFavorited;
      setIsFavorited(newIsFavorited);
      queryClient.invalidateQueries({ queryKey: ['post', slug] });
    },
  });

  // 增加浏览量（只执行一次）
  useEffect(() => {
    if (data?.data?.id && !hasIncremented.current) {
      hasIncremented.current = true;
      postsApi.incrementViewCount(data.data.id).catch(() => {
        // 静默失败
      });
    }
  }, [data?.data?.id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
              <div className="h-64 bg-gray-200 rounded mb-8" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500">文章不存在或加载失败</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-full flex bg-white">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full">
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Main Content */}
                <article>
                  {/* Header */}
                  <header className="mb-8">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {post.category && (
                        <Link
                          href={`/categories?category=${encodeURIComponent(post.category.slug)}`}
                          className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100"
                        >
                          {post.category.name}
                        </Link>
                      )}
                      {post.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/tags?tag=${encodeURIComponent(tag.name)}`}
                          className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

                    {post.summary && <p className="text-xl text-gray-600 mb-6">{post.summary}</p>}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          {post.author.avatar ? (
                            (() => {
                              // 检查是否是 SVG 图片
                              const isSvgAvatar =
                                post.author.avatar.endsWith('.svg') ||
                                post.author.avatar.includes('.svg?') ||
                                post.author.avatar.includes('/svg');
                              return isSvgAvatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={post.author.avatar}
                                  alt={post.author.nickname || post.author.username}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                              ) : (
                                <Image
                                  src={post.author.avatar}
                                  alt={post.author.nickname || post.author.username}
                                  width={32}
                                  height={32}
                                  loading="lazy"
                                  className="rounded-full"
                                />
                              );
                            })()
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary-600" />
                            </div>
                          )}
                          <Link
                            href={`/users/${post.author.username}`}
                            className="hover:text-primary-600"
                          >
                            {post.author.nickname || post.author.username}
                          </Link>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <time>{formatRelativeTime(post.publishedAt || post.createdAt)}</time>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{formatNumber(post.viewCount)}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (isAuthenticated) {
                              likeMutation.mutate();
                            }
                          }}
                          disabled={!isAuthenticated || likeMutation.isPending}
                          className={`flex items-center gap-1 transition-colors ${
                            isLiked
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-gray-500 hover:text-red-600'
                          } ${!isAuthenticated ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          title={isAuthenticated ? (isLiked ? '取消点赞' : '点赞') : '请先登录'}
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                          <span>{formatNumber(likeCount)}</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{formatNumber(post.commentCount)}</span>
                        </div>
                        {isAuthenticated && (
                          <button
                            onClick={() => favoriteMutation.mutate()}
                            disabled={favoriteMutation.isPending}
                            className={`flex items-center gap-1 transition-colors ${
                              isFavorited
                                ? 'text-yellow-600 hover:text-yellow-700'
                                : 'text-gray-500 hover:text-yellow-600'
                            }`}
                            title={isFavorited ? '取消收藏' : '收藏'}
                          >
                            <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  </header>

                  {/* Cover Image */}
                  {post.coverImage && (
                    <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        key={`post-detail-${post.id}-${post.coverImage}`}
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        style={{ objectPosition: 'center' }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <PostContent content={post.content} />

                  {/* Comments */}
                  <div className="mt-12">
                    <PostComments postId={post.id} />
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 独立的导航和定制化卡片区域 */}
        <aside className="hidden lg:block w-80 flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <Sidebar />
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
