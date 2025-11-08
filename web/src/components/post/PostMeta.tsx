'use client';

import Link from 'next/link';
import { Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';
import { formatRelativeTime, formatNumber } from '@/lib/utils/format';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';
import type { Post } from '@/lib/api/types';

interface PostMetaProps {
  post: Post;
  featured?: boolean;
}

export function PostMeta({ post, featured = false }: PostMetaProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100',
        featured && 'pt-6',
      )}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Avatar
            src={post.author.avatar}
            alt={post.author.nickname || post.author.username}
            size="sm"
          />
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
  );
}

