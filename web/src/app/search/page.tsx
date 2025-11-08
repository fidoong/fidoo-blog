'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostList } from '@/components/post/PostList';
import { Sidebar } from '@/components/layout/Sidebar';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const searchQuery = searchParams.get('q') || '';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">搜索</h1>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索文章..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  搜索
                </button>
              </form>
            </div>

            {searchQuery ? (
              <div>
                <p className="text-gray-600 mb-4">
                  搜索结果：<span className="font-semibold">{searchQuery}</span>
                </p>
                <PostList
                  params={{
                    status: 'published',
                    keyword: searchQuery,
                    page: 1,
                    pageSize: 12,
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">请输入关键词搜索</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
