'use client';

import * as React from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { Tag } from '@/lib/api/types';

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: string[];
  onToggle: (tagId: string) => void;
  label?: string;
}

export function TagSelector({
  tags,
  selectedTagIds,
  onToggle,
  label = '标签',
}: TagSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <TagIcon className="inline h-4 w-4 mr-1" />
        {label}
      </label>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[60px] max-h-32 overflow-y-auto custom-scrollbar">
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500">暂无标签</p>
        ) : (
          tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggle(tag.id)}
                className={cn(
                  'transition-all duration-200 hover:scale-105 active:scale-95',
                  isSelected && 'ring-2 ring-primary-500 ring-offset-1',
                )}
              >
                <Badge
                  variant={isSelected ? 'default' : 'secondary'}
                  style={
                    isSelected && tag.color
                      ? {
                          backgroundColor: tag.color,
                          color: 'white',
                        }
                      : undefined
                  }
                  className="cursor-pointer"
                >
                  {tag.name}
                </Badge>
              </button>
            );
          })
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">点击标签进行选择/取消</p>
    </div>
  );
}

