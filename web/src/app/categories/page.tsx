'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api/categories';
import { MainLayout } from '@/components/layout/MainLayout';
import Link from 'next/link';
import { Folder } from 'lucide-react';

export default function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const categories = data?.data || [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">所有分类</h1>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Folder className="h-6 w-6 text-primary-600 group-hover:text-primary-700" />
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                      {category.name}
                    </h2>
                  </div>
                  {category.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
