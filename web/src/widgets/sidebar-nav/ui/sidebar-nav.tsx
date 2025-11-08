'use client';

import { Category } from '@/lib/api/types';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { Home, TrendingUp } from 'lucide-react';

interface SidebarNavProps {
  categories: Category[];
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export function SidebarNav({
  categories,
  selectedCategory = '',
  onCategoryChange,
}: SidebarNavProps) {
  const navItems = [
    { id: '', name: '综合', slug: '', icon: Home },
    { id: 'trending', name: '热门', slug: 'trending', icon: TrendingUp },
  ];

  return (
    <Card className="p-4 border border-gray-100 shadow-soft sticky top-20 bg-white rounded-xl">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = selectedCategory === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onCategoryChange?.(item.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2.5',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary',
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </button>
          );
        })}
        {categories.length > 0 && (
          <>
            <div className="h-px bg-gray-200 my-2" />
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange?.(category.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary',
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </>
        )}
      </nav>
    </Card>
  );
}
