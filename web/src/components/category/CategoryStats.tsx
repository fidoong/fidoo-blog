'use client';

import { FileText, Tag, Users, Eye } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CategoryStatsProps {
  postCount?: number;
  tagCount?: number;
  authorCount?: number;
  totalViews?: number;
  className?: string;
}

export function CategoryStats({
  postCount = 0,
  tagCount = 0,
  authorCount = 0,
  totalViews = 0,
  className,
}: CategoryStatsProps) {
  const stats = [
    {
      label: '文章数',
      value: postCount,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '标签数',
      value: tagCount,
      icon: Tag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: '作者数',
      value: authorCount,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: '总浏览量',
      value: totalViews,
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      format: (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toString()),
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const displayValue = stat.format ? stat.format(stat.value) : stat.value;
        return (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('p-1.5 rounded', stat.bgColor)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <span className="text-xs text-gray-600">{stat.label}</span>
            </div>
            <div className={cn('text-lg font-semibold', stat.color)}>{displayValue}</div>
          </div>
        );
      })}
    </div>
  );
}
