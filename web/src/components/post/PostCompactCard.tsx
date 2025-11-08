'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Eye, Heart, MessageCircle, User, Tag } from 'lucide-react';
import { formatRelativeTime, formatNumber } from '@/lib/utils/format';
import type { Post } from '@/lib/api/types';

interface PostCompactCardProps {
  post: Post;
  priority?: boolean;
}

export function PostCompactCard({ post, priority = false }: PostCompactCardProps) {
  const router = useRouter();
  const isSvgAvatar = post.author.avatar
    ? post.author.avatar.endsWith('.svg') ||
      post.author.avatar.includes('.svg?') ||
      post.author.avatar.includes('/svg')
    : false;

  const handleCardClick = () => {
    router.push(`/posts/${post.slug}`);
  };

  return (
    <article
      className="group bg-white border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex gap-4 p-4">
          {/* 缩略图 */}
          {post.coverImage && (
            <div className="relative flex-shrink-0 w-32 h-20 md:w-40 md:h-24 rounded-lg overflow-hidden bg-gray-100">
              <Image
                key={`post-compact-${post.id}-${post.coverImage}`}
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 128px, 160px"
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ objectPosition: 'center' }}
              />
            </div>
          )}

          {/* 内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 标题和置顶标签 */}
            <div className="flex items-start gap-2 mb-1.5">
              {post.isTop && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded flex-shrink-0">
                  置顶
                </span>
              )}
              <Link
                href={`/posts/${post.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug block"
              >
                {post.title}
              </Link>
            </div>

            {/* 摘要 */}
            {post.summary && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                {post.summary}
              </p>
            )}

            {/* 元信息行 */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
              {/* 分类和标签 */}
              <div className="flex items-center gap-2 flex-wrap">
                {post.category && (
                  <Link
                    href={`/categories?category=${encodeURIComponent(post.category.slug)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                  >
                    <span className="text-[10px]">{post.category.name}</span>
                  </Link>
                )}
                {post.tags.slice(0, 2).map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags?tag=${encodeURIComponent(tag.name)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    <span>{tag.name}</span>
                  </Link>
                ))}
              </div>

              {/* 分隔符 */}
              <span className="text-gray-300">•</span>

              {/* 作者 */}
              <div className="flex items-center gap-1.5">
                {post.author.avatar ? (
                  isSvgAvatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.nickname || post.author.username}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  ) : (
                    <Image
                      src={post.author.avatar}
                      alt={post.author.nickname || post.author.username}
                      width={16}
                      height={16}
                      loading="lazy"
                      className="rounded-full"
                    />
                  )
                ) : (
                  <User className="h-3.5 w-3.5" />
                )}
                <Link
                  href={`/users/${post.author.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-primary-600 transition-colors"
                >
                  {post.author.nickname || post.author.username}
                </Link>
              </div>

              {/* 时间 */}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <time>{formatRelativeTime(post.publishedAt || post.createdAt)}</time>
              </div>

              {/* 统计数据 */}
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{formatNumber(post.viewCount)}</span>
                </div>
                {post.likeCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{formatNumber(post.likeCount)}</span>
                  </div>
                )}
                {post.commentCount > 0 && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{formatNumber(post.commentCount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </article>
  );
}
