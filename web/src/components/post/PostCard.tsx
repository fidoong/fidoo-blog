'use client';

import { cn } from '@/lib/utils/cn';
import type { Post } from '@/lib/api/types';
import { PostImage } from './PostImage';
import { PostTags } from './PostTags';
import { PostTitle } from './PostTitle';
import { PostMeta } from './PostMeta';
import { FadeIn } from '@/components/ui/animation';

interface PostCardProps {
  post: Post;
  featured?: boolean;
  priority?: boolean;
}

export function PostCard({ post, featured = false, priority = false }: PostCardProps) {
  return (
    <FadeIn>
      <article
        className={cn(
          'group bg-white rounded-xl border border-gray-200 overflow-hidden',
          'hover:shadow-xl hover:border-primary-200',
          'transition-all duration-300 flex flex-col',
          'card-hover',
          featured && 'md:col-span-2',
        )}
      >
        {post.coverImage && (
          <PostImage
            coverImage={post.coverImage}
            title={post.title}
            slug={post.slug}
            featured={featured}
            priority={priority}
          />
        )}

        <div className={cn('p-6 flex-1 flex flex-col', featured && 'md:p-8')}>
          <PostTags category={post.category} tags={post.tags} maxTags={3} />

          <PostTitle
            title={post.title}
            slug={post.slug}
            isTop={post.isTop}
            featured={featured}
          />

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

          <PostMeta post={post} featured={featured} />
        </div>
      </article>
    </FadeIn>
  );
}
