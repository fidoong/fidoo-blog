'use client';

import { useState } from 'react';
import { ArrowUpDown, Clock, TrendingUp, Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type SortOption = 'latest' | 'popular' | 'views' | 'likes';

interface CategoryFiltersProps {
  onSortChange?: (sort: SortOption) => void;
  currentSort?: SortOption;
  className?: string;
}

export function CategoryFilters({
  onSortChange,
  currentSort = 'latest',
  className,
}: CategoryFiltersProps) {
  const [sort, setSort] = useState<SortOption>(currentSort);

  const sortOptions: { value: SortOption; label: string; icon: typeof Clock }[] = [
    { value: 'latest', label: '最新', icon: Clock },
    { value: 'popular', label: '热门', icon: TrendingUp },
    { value: 'views', label: '浏览量', icon: Eye },
    { value: 'likes', label: '点赞数', icon: Heart },
  ];

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    onSortChange?.(newSort);
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <div className="flex items-center gap-1.5 text-sm text-gray-600">
        <ArrowUpDown className="h-4 w-4" />
        <span>排序：</span>
      </div>
      <div className="flex items-center gap-1.5">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = sort === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-all',
                isActive
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
