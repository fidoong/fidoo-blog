'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';
import { formatRelativeTime, formatNumber } from '@/lib/utils/format';
import { useIntersection } from '@/hooks/useIntersection';
import { cn } from '@/lib/utils/cn';
import type { Post } from '@/lib/api/types';

interface PostCardOptimizedProps {
  post: Post;
  featured?: boolean;
  priority?: boolean;
}

export const PostCardOptimized = memo(function PostCardOptimized({
  post,
  featured = false,
  priority = false,
}: PostCardOptimizedProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { ref, inView } = useIntersection({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary-200',
        featured && 'md:col-span-2',
      )}
    >
      <Link href={`/posts/${post.slug}`} className="block h-full">
        {/* 封面图片 */}
        {post.coverImage && (
          <div className="relative h-48 w-full overflow-hidden bg-gray-100 md:h-56">
            {inView && (
              <Image
                key={`post-card-${post.id}-${post.coverImage}`}
                src={post.coverImage}
                alt={post.title}
                fill
                sizes={
                  featured
                    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                    : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                }
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                className={cn(
                  'object-cover transition-transform duration-500',
                  imageLoaded ? 'scale-100' : 'scale-105',
                )}
                style={{ objectPosition: 'center' }}
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </div>
        )}

        {/* 内容 */}
        <div className="p-6">
          {/* 分类和标签 */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {post.category && (
              <Link
                href={`/categories?category=${encodeURIComponent(post.category.slug)}`}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {post.category.name}
              </Link>
            )}
            {post.tags && post.tags.length > 0 && (
              <span className="text-xs text-gray-500">
                {post.tags
                  .slice(0, 2)
                  .map((tag) => tag.name)
                  .join(', ')}
              </span>
            )}
          </div>

          {/* 标题 */}
          <h2 className="mb-3 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {post.title}
          </h2>

          {/* 摘要 */}
          {post.summary && (
            <p className="mb-4 line-clamp-2 text-sm text-gray-600">{post.summary}</p>
          )}

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.nickname || post.author.username}
                  className="h-5 w-5 rounded-full"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span>{post.author.nickname || post.author.username}</span>
            </div>
            {post.publishedAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.publishedAt}>{formatRelativeTime(post.publishedAt)}</time>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(post.viewCount)}</span>
            </div>
            {post.likeCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>{formatNumber(post.likeCount)}</span>
              </div>
            )}
            {post.commentCount > 0 && (
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                <span>{formatNumber(post.commentCount)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
});
