'use client';

import { use, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { postsApi } from '@/lib/api/posts';
import { MainLayout } from '@/components/layout/MainLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import Image from 'next/image';
import { Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';
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

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const hasIncremented = useRef(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getPostBySlug(slug),
    enabled: !!slug,
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

  if (error || !data?.data) {
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

  const post = data.data;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {post.category && (
                  <Link
                    href={`/categories/${post.category.slug}`}
                    className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100"
                  >
                    {post.category.name}
                  </Link>
                )}
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
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
                      <Image
                        src={post.author.avatar}
                        alt={post.author.nickname || post.author.username}
                        width={32}
                        height={32}
                        loading="lazy"
                        className="rounded-full"
                      />
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
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{formatNumber(post.likeCount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{formatNumber(post.commentCount)}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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

          {/* Sidebar - 固定侧边栏 */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 lg:self-start lg:pl-2">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
