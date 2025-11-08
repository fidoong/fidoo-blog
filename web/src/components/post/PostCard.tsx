import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';
import { formatRelativeTime, formatNumber } from '@/lib/utils/format';
import type { Post } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

interface PostCardProps {
  post: Post;
  featured?: boolean;
  priority?: boolean;
}

export function PostCard({ post, featured = false, priority = false }: PostCardProps) {
  // 检查是否是 SVG 图片（检查 URL 是否包含 .svg 或 svg? 参数）
  const isSvgAvatar = post.author.avatar
    ? post.author.avatar.endsWith('.svg') ||
      post.author.avatar.includes('.svg?') ||
      post.author.avatar.includes('/svg')
    : false;

  return (
    <article
      className={cn(
        'group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 flex flex-col',
        featured && 'md:col-span-2',
      )}
    >
      {post.coverImage && (
        <Link href={`/posts/${post.slug}`}>
          <div
            className={cn(
              'relative w-full overflow-hidden bg-gray-100',
              featured ? 'h-64 md:h-80' : 'h-48 md:h-56',
            )}
            style={{ aspectRatio: featured ? '16/9' : '16/10' }}
          >
            <Image
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
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
      )}

      <div className={cn('p-6 flex-1 flex flex-col', featured && 'md:p-8')}>
        {/* Category and Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {tag.name}
            </Link>
          ))}
        </div>

        {/* Title */}
        <Link href={`/posts/${post.slug}`}>
          <h2
            className={cn(
              'font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors',
              featured ? 'text-2xl md:text-3xl line-clamp-2' : 'text-lg md:text-xl line-clamp-2',
            )}
          >
            {post.isTop && (
              <span className="inline-block mr-2 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md shadow-sm">
                置顶
              </span>
            )}
            {post.title}
          </h2>
        </Link>

        {/* Summary */}
        {post.summary && (
          <p
            className={cn(
              'text-gray-600 mb-4 flex-1',
              featured ? 'text-base line-clamp-3' : 'text-sm line-clamp-2',
            )}
          >
            {post.summary}
          </p>
        )}

        {/* Meta Info */}
        <div
          className={cn(
            'flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100',
            featured && 'pt-6',
          )}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              {post.author.avatar ? (
                isSvgAvatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.nickname || post.author.username}
                    width={24}
                    height={24}
                    className="rounded-full ring-2 ring-gray-100"
                  />
                ) : (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.nickname || post.author.username}
                    width={24}
                    height={24}
                    loading="lazy"
                    className="rounded-full ring-2 ring-gray-100"
                  />
                )
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
              <Link
                href={`/users/${post.author.username}`}
                className="hover:text-primary-600 font-medium transition-colors"
              >
                {post.author.nickname || post.author.username}
              </Link>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time>{formatRelativeTime(post.publishedAt || post.createdAt)}</time>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span className="font-medium">{formatNumber(post.viewCount)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              <span className="font-medium">{formatNumber(post.likeCount)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{formatNumber(post.commentCount)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
