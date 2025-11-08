'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api/categories';
import { postsApi } from '@/lib/api/posts';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostList } from '@/components/post/PostList';
import { Sidebar } from '@/components/layout/Sidebar';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: categoryData } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const categories = await categoriesApi.getCategories();
      return categories.data.find((c) => c.slug === slug);
    },
    enabled: !!slug,
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content - 可滚动区域 */}
          <div className="lg:col-span-3">
            {categoryData && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryData.name}</h1>
                {categoryData.description && (
                  <p className="text-gray-600">{categoryData.description}</p>
                )}
              </div>
            )}
            <PostList
              params={{
                status: 'published',
                categoryId: categoryData?.id,
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
