'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/lib/api/posts';
import { tagsApi } from '@/lib/api/tags';
import { CategoryTagCloud } from './CategoryTagCloud';
import { TrendingUp, Clock } from 'lucide-react';
import type { Category } from '@/lib/api/types';

interface CategorySidebarProps {
  category: Category;
  className?: string;
}

export function CategorySidebar({ category, className }: CategorySidebarProps) {
  // 获取热门文章（按浏览量排序）
  const { data: hotPostsData } = useQuery({
    queryKey: ['hot-posts', category.id],
    queryFn: () =>
      postsApi.getPosts({
        categoryId: category.id,
        categoryLevel: category.level,
        status: 'published',
        sortBy: 'viewCount',
        sortOrder: 'DESC',
        page: 1,
        pageSize: 5,
      }),
    enabled: !!category.id,
  });

  // 获取最新文章
  const { data: latestPostsData } = useQuery({
    queryKey: ['latest-posts', category.id],
    queryFn: () =>
      postsApi.getPosts({
        categoryId: category.id,
        categoryLevel: category.level,
        status: 'published',
        sortBy: 'publishedAt',
        sortOrder: 'DESC',
        page: 1,
        pageSize: 5,
      }),
    enabled: !!category.id,
  });

  // 获取该分类下的标签
  const { data: tagsData } = useQuery({
    queryKey: ['category-tags', category.id],
    queryFn: () => tagsApi.getTagsByCategoryId(category.id),
    enabled: !!category.id,
  });

  const hotPosts = hotPostsData?.items || [];
  const latestPosts = latestPostsData?.items || [];
  const tags = tagsData || [];

  return (
    <aside className={className}>
      <div className="space-y-6">
        {/* 热门文章 */}
        {hotPosts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <div className="p-1.5 bg-orange-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              热门文章
            </h3>
            <div className="space-y-3">
              {hotPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                >
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{post.author.nickname || post.author.username}</span>
                    <span>•</span>
                    <span>{post.viewCount.toLocaleString()} 浏览</span>
                    {post.likeCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{post.likeCount} 赞</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 最新文章 */}
        {latestPosts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              最新文章
            </h3>
            <div className="space-y-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{post.author.nickname || post.author.username}</span>
                    <span>•</span>
                    <span>{post.viewCount.toLocaleString()} 浏览</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 标签云 */}
        {tags.length > 0 && <CategoryTagCloud tags={tags} maxTags={15} />}
      </div>
    </aside>
  );
}
