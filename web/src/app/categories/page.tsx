'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { postsApi } from '@/lib/api/posts';
import { tagsApi } from '@/lib/api/tags';
import { categoriesApi } from '@/lib/api/categories';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostCompactList } from '@/components/post/PostCompactList';
import { Sidebar } from '@/components/layout/Sidebar';
import { CategoryFilters, type SortOption } from '@/components/category/CategoryFilters';
import { CategoryTagCloud } from '@/components/category/CategoryTagCloud';
import { CategorySidebar } from '@/components/category/CategorySidebar';
import { RelatedCategories } from '@/components/category/RelatedCategories';
import Image from 'next/image';
import Link from 'next/link';

export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategorySlug = searchParams.get('category');
  const [sortOption, setSortOption] = useState<SortOption>('latest');

  // 获取所有标签
  const { data: tagsData } = useQuery({
    queryKey: ['all-tags'],
    queryFn: () => tagsApi.getTags(),
  });

  // 获取所有主分类
  const { data: mainCategoriesData } = useQuery({
    queryKey: ['main-categories'],
    queryFn: () => categoriesApi.getMainCategories(),
  });

  // 获取所有分类（用于查找选中的分类）
  const { data: allCategoriesData } = useQuery({
    queryKey: ['all-categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  // 获取选中的分类信息
  const selectedCategory = useMemo(() => {
    if (!selectedCategorySlug || !allCategoriesData) return null;
    return allCategoriesData.find((cat) => cat.slug === selectedCategorySlug);
  }, [selectedCategorySlug, allCategoriesData]);

  // 获取同级分类（用于相关分类推荐）
  const { data: siblingCategoriesData } = useQuery({
    queryKey: ['sibling-categories', selectedCategory?.parentId],
    queryFn: () =>
      selectedCategory?.parentId
        ? categoriesApi.getCategoriesByParentId(selectedCategory.parentId)
        : categoriesApi.getMainCategories(),
    enabled: !!selectedCategory,
  });

  // 获取精选文章
  const { data: featuredPostsData } = useQuery({
    queryKey: ['category-featured-posts', selectedCategory?.id],
    queryFn: () =>
      postsApi.getPosts({
        categoryId: selectedCategory?.id,
        categoryLevel: selectedCategory?.level,
        status: 'published',
        page: 1,
        pageSize: selectedCategory ? 3 : 3,
        sortBy: 'publishedAt',
        sortOrder: 'DESC',
      }),
  });

  // 根据排序选项和选中的分类生成查询参数
  const listParams = useMemo(() => {
    const baseParams = {
      categoryId: selectedCategory?.id,
      categoryLevel: selectedCategory?.level,
      status: 'published' as const,
      page: 1,
      pageSize: 20,
    };

    switch (sortOption) {
      case 'latest':
        return { ...baseParams, sortBy: 'publishedAt', sortOrder: 'DESC' as const };
      case 'popular':
        return { ...baseParams, sortBy: 'viewCount', sortOrder: 'DESC' as const };
      case 'views':
        return { ...baseParams, sortBy: 'viewCount', sortOrder: 'DESC' as const };
      case 'likes':
        return { ...baseParams, sortBy: 'likeCount', sortOrder: 'DESC' as const };
      default:
        return baseParams;
    }
  }, [selectedCategory?.id, selectedCategory?.level, sortOption]);

  const tags = tagsData || [];
  const mainCategories = mainCategoriesData || [];

  const handleCategoryClick = (categorySlug: string) => {
    if (selectedCategorySlug === categorySlug) {
      // 如果点击的是已选中的分类，清除选择
      router.push('/categories');
    } else {
      // 设置选中的分类
      router.push(`/categories?category=${encodeURIComponent(categorySlug)}`);
    }
  };

  return (
    <MainLayout>
      <div className="h-full flex bg-white">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full">
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Main Content */}
                <div>
                  {/* 主分类快速入口 */}
                  {mainCategories.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {mainCategories.map((category) => {
                          const isSelected = selectedCategorySlug === category.slug;
                          return (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.slug)}
                              className={`
                                inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-all
                                ${
                                  isSelected
                                    ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700'
                                    : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                                }
                              `}
                            >
                              {category.icon && <span className="text-lg">{category.icon}</span>}
                              <span className="text-sm font-medium">{category.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 精选文章预览 */}
                  {featuredPostsData?.items && featuredPostsData.items.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {featuredPostsData.items.slice(0, 3).map((post) => (
                        <Link
                          key={post.id}
                          href={`/posts/${post.slug}`}
                          className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-primary-300 transition-all"
                        >
                          {post.coverImage && (
                            <div className="relative w-full h-32 mb-3 rounded overflow-hidden bg-gray-100">
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                          {post.summary && (
                            <p className="text-xs text-gray-600 line-clamp-2">{post.summary}</p>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* 筛选和排序工具栏 */}
                  <CategoryFilters
                    currentSort={sortOption}
                    onSortChange={setSortOption}
                    className="mb-6"
                  />

                  {/* Posts List - 所有分类的文章 */}
                  <div>
                    <PostCompactList params={listParams} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 独立的导航和定制化卡片区域 */}
        <aside className="hidden lg:block w-80 flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-4">
            {/* 分类专用侧边栏（热门文章、最新文章、标签） */}
            {selectedCategory && <CategorySidebar category={selectedCategory} />}

            {/* 相关分类推荐 */}
            {siblingCategoriesData && siblingCategoriesData.length > 0 && (
              <RelatedCategories
                categories={siblingCategoriesData}
                currentCategoryId={selectedCategory?.id}
              />
            )}

            {/* 标签云 */}
            {tags.length > 0 && <CategoryTagCloud tags={tags.slice(0, 20)} maxTags={15} />}
            <Sidebar />
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
