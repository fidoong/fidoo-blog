'use client';

import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '@/lib/api/tags';
import { MainLayout } from '@/components/layout/MainLayout';
import Link from 'next/link';
import { Tag as TagIcon } from 'lucide-react';

export default function TagsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  });

  const tags = data?.data || [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">所有标签</h1>

          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-primary-100 hover:text-primary-600 transition-colors flex items-center gap-2"
                  style={
                    tag.color
                      ? {
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          borderColor: tag.color,
                        }
                      : {}
                  }
                >
                  <TagIcon className="h-4 w-4" />
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
