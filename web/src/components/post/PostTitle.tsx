'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';

interface PostTitleProps {
  title: string;
  slug: string;
  isTop?: boolean;
  featured?: boolean;
}

export function PostTitle({ title, slug, isTop = false, featured = false }: PostTitleProps) {
  return (
    <Link href={`/posts/${slug}`}>
      <h2
        className={cn(
          'font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors',
          featured ? 'text-2xl md:text-3xl line-clamp-2' : 'text-lg md:text-xl line-clamp-2',
        )}
      >
        {isTop && (
          <Badge
            variant="danger"
            className="inline-block mr-2 mb-1"
          >
            置顶
          </Badge>
        )}
        {title}
      </h2>
    </Link>
  );
}

