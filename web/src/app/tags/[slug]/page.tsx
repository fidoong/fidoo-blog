'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '@/lib/api/tags';
import { postsApi } from '@/lib/api/posts';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostList } from '@/components/post/PostList';
import { Sidebar } from '@/components/layout/Sidebar';

export default function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: tagData } = useQuery({
    queryKey: ['tag', slug],
    queryFn: async () => {
      const tags = await tagsApi.getTags();
      return tags.data.find((t) => t.slug === slug);
    },
    enabled: !!slug,
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content - 可滚动区域 */}
          <div className="lg:col-span-3">
            {tagData && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">#{tagData.name}</h1>
              </div>
            )}
            <PostList
              params={{
                status: 'published',
                keyword: tagData?.name,
                page: 1,
                pageSize: 12,
              }}
            />
          </div>
          {/* Sidebar - 固定侧边栏 */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 lg:self-start lg:pl-2">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
