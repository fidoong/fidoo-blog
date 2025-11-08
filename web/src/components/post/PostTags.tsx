'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/lib/api/types';

interface PostTagsProps {
  category?: { id: string; name: string; slug: string } | null;
  tags: Tag[];
  maxTags?: number;
}

export function PostTags({ category, tags, maxTags = 3 }: PostTagsProps) {
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      {category && (
        <Link
          href={`/categories?category=${encodeURIComponent(category.slug)}`}
          className="transition-transform duration-200 hover:scale-105"
        >
          <Badge variant="default" className="cursor-pointer">
            {category.name}
          </Badge>
        </Link>
      )}
      {tags.slice(0, maxTags).map((tag) => (
        <Link
          key={tag.id}
          href={`/tags?tag=${encodeURIComponent(tag.name)}`}
          className="transition-transform duration-200 hover:scale-105"
        >
          <Badge
            variant="secondary"
            className="cursor-pointer"
            style={tag.color ? { backgroundColor: tag.color, color: 'white' } : undefined}
          >
            {tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

