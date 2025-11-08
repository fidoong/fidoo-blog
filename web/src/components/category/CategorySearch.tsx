'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils/cn';
import type { Category } from '@/lib/api/types';

interface CategorySearchProps {
  categories: Category[];
  onFilterChange?: (filtered: Category[]) => void;
  className?: string;
}

export function CategorySearch({ categories, onFilterChange, className }: CategorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredCategories = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return categories;
    }

    const term = debouncedSearchTerm.toLowerCase();
    return categories.filter((category) => {
      const matchesName = category.name.toLowerCase().includes(term);
      const matchesDescription = category.description?.toLowerCase().includes(term);
      const matchesChildren = category.children?.some((child) =>
        child.name.toLowerCase().includes(term),
      );

      return matchesName || matchesDescription || matchesChildren;
    });
  }, [categories, debouncedSearchTerm]);

  // 通知父组件过滤结果变化
  useEffect(() => {
    onFilterChange?.(filteredCategories);
  }, [filteredCategories, onFilterChange]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索分类..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
      {searchTerm && (
        <div className="mt-2 text-sm text-gray-500">
          找到 {filteredCategories.length} 个分类
        </div>
      )}
    </div>
  );
}

