'use client';

import Link from 'next/link';
import { Folder, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Category } from '@/lib/api/types';

interface RelatedCategoriesProps {
  categories: Category[];
  currentCategoryId?: string;
  className?: string;
}

export function RelatedCategories({
  categories,
  currentCategoryId,
  className,
}: RelatedCategoriesProps) {
  // 过滤掉当前分类
  const relatedCategories = categories.filter((cat) => cat.id !== currentCategoryId);

  if (relatedCategories.length === 0) {
    return null;
  }

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-4', className)}>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Folder className="h-4 w-4 text-primary-600" />
        相关分类
      </h3>
      <div className="space-y-2">
        {relatedCategories.slice(0, 6).map((category) => (
          <Link
            key={category.id}
            href={`/categories?category=${encodeURIComponent(category.slug)}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {category.icon ? (
                <span className="text-lg flex-shrink-0">{category.icon}</span>
              ) : (
                <Folder className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <span className="text-sm text-gray-700 group-hover:text-primary-600 truncate">
                {category.name}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
