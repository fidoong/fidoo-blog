'use client';

import { ArrowUpDown, TrendingUp, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type CategorySortOption = 'default' | 'posts' | 'views' | 'latest';

interface CategorySortProps {
  currentSort: CategorySortOption;
  onSortChange: (sort: CategorySortOption) => void;
  className?: string;
}

export function CategorySort({ currentSort, onSortChange, className }: CategorySortProps) {
  const sortOptions: { value: CategorySortOption; label: string; icon: typeof FileText }[] = [
    { value: 'default', label: '默认', icon: ArrowUpDown },
    { value: 'posts', label: '文章数', icon: FileText },
    { value: 'views', label: '浏览量', icon: TrendingUp },
    { value: 'latest', label: '最新', icon: Clock },
  ];

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className="text-sm text-gray-600">排序：</span>
      <div className="flex items-center gap-1.5">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentSort === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
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

