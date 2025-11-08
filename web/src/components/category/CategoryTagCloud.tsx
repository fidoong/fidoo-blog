'use client';

import Link from 'next/link';
import { Tag as TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Tag } from '@/lib/api/types';

interface CategoryTagCloudProps {
  tags: Tag[];
  maxTags?: number;
  className?: string;
}

export function CategoryTagCloud({ tags, maxTags = 20, className }: CategoryTagCloudProps) {
  const displayTags = tags.slice(0, maxTags);

  if (displayTags.length === 0) {
    return null;
  }

  // 根据使用频率或文章数计算标签大小
  const getTagSize = (index: number) => {
    if (index < 3) return 'text-sm';
    if (index < 8) return 'text-xs';
    return 'text-[10px]';
  };

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <TagIcon className="h-4 w-4 text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-900">热门标签</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag, index) => (
          <Link
            key={tag.id}
            href={`/tags?tag=${encodeURIComponent(tag.name)}`}
            className={cn(
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all hover:shadow-sm',
              getTagSize(index),
              tag.color
                ? 'border-gray-200 hover:border-primary-300'
                : 'bg-gray-50 border-gray-200 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600',
            )}
            style={
              tag.color
                ? {
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    borderColor: tag.color,
                  }
                : {}
            }
          >
            <TagIcon className="h-3 w-3" />
            <span>{tag.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
