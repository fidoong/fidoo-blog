'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { postsApi } from '@/lib/api/posts';
import { formatRelativeTime } from '@/lib/utils/format';
import type { Category } from '@/lib/api/types';

interface CategoryCardProps {
  category: Category;
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  const hasChildren = category.children && category.children.length > 0;

  // 获取该分类下的最新文章（用于内容预览）
  const { data: latestPostsData } = useQuery({
    queryKey: ['category-latest-posts-preview', category.id],
    queryFn: () =>
      postsApi.getPosts({
        categoryId: category.id,
        categoryLevel: category.level,
        status: 'published',
        page: 1,
        pageSize: 3,
        sortBy: 'publishedAt',
        sortOrder: 'DESC',
      }),
    enabled: !!category.id,
  });

  const latestPosts = latestPostsData?.items || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-300 transition-all duration-300"
    >
      <Link href={`/categories?category=${encodeURIComponent(category.slug)}`} className="block">
        {/* 头部区域 */}
        <div className="p-6 bg-gradient-to-br from-primary-50 to-blue-50 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* 图标 */}
              <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                {category.icon ? (
                  <span className="text-3xl">{category.icon}</span>
                ) : (
                  <FileText className="h-8 w-8 text-primary-600" />
                )}
              </div>

              {/* 标题和描述 */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                )}
              </div>
            </div>

            {/* 箭头 */}
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </div>

        {/* 最新文章预览 */}
        {latestPosts.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">最新文章</span>
            </div>
            <div className="space-y-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="block group/item"
                >
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    {post.coverImage && (
                      <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-100">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover/item:text-primary-600 line-clamp-2 mb-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{post.author.nickname || post.author.username}</span>
                        <span>•</span>
                        <time>{formatRelativeTime(post.publishedAt || post.createdAt)}</time>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 子分类预览 */}
        {hasChildren && (
          <div className="px-6 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-500">子分类</span>
              <span className="text-xs text-gray-400">({category.children?.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.children?.slice(0, 6).map((child) => (
                <Link
                  key={child.id}
                  href={`/categories?category=${encodeURIComponent(child.slug)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-md hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-colors"
                >
                  {child.name}
                </Link>
              ))}
              {category.children && category.children.length > 6 && (
                <span className="px-2.5 py-1 text-xs text-gray-400">
                  +{category.children.length - 6} 个
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

