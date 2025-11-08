'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { categoriesApi } from '@/lib/api/categories';
import { tagsApi } from '@/lib/api/tags';
import Link from 'next/link';
import { TrendingUp, Tag as TagIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useMemo } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  });

  const categories = useMemo(() => {
    const cats = categoriesData?.data || [];
    // 过滤激活的分类并按排序顺序排列
    return cats
      .filter((cat) => cat.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 12);
  }, [categoriesData]);

  const tags = useMemo(() => {
    return (tagsData?.data || []).slice(0, 24);
  }, [tagsData]);

  // 检查当前路径是否是分类页面
  const isCategoryPage = pathname?.startsWith('/categories/');
  const currentCategorySlug = isCategoryPage ? pathname.split('/')[2] : null;

  // 检查当前路径是否是标签页面
  const isTagPage = pathname?.startsWith('/tags/');
  const currentTagSlug = isTagPage ? pathname.split('/')[2] : null;

  return (
    <aside className="space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto lg:overflow-y-visible custom-scrollbar">
      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
          <div className="p-1.5 bg-primary-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-primary-600" />
          </div>
          分类
        </h3>
        <ul className="space-y-1 max-h-[calc(50vh-12rem)] overflow-y-auto custom-scrollbar -mr-1 pr-2">
          {categories.length === 0 ? (
            <li className="text-sm text-gray-400 py-2">暂无分类</li>
          ) : (
            categories.map((category, index) => {
              const isActive = currentCategorySlug === category.slug;
              return (
                <motion.li
                  key={category.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    href={`/categories/${category.slug}`}
                    className={cn(
                      'flex items-center justify-between text-sm py-2 px-3 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      <span>{category.name}</span>
                    </span>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600 group-hover:translate-x-0.5',
                      )}
                    />
                  </Link>
                </motion.li>
              );
            })
          )}
        </ul>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
          <div className="p-1.5 bg-primary-50 rounded-lg">
            <TagIcon className="h-4 w-4 text-primary-600" />
          </div>
          热门标签
        </h3>
        <div className="flex flex-wrap gap-2 max-h-[calc(50vh-12rem)] overflow-y-auto custom-scrollbar -mr-1 pr-2">
          {tags.length === 0 ? (
            <span className="text-sm text-gray-400">暂无标签</span>
          ) : (
            tags.map((tag, index) => {
              const isActive = currentTagSlug === tag.slug;
              return (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/tags/${tag.slug}`}
                    className={cn(
                      'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200',
                      isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                        : tag.color
                          ? 'bg-gray-100 text-gray-700 hover:shadow-md hover:scale-105'
                          : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-primary-50 hover:to-primary-100 hover:text-primary-600',
                    )}
                    style={
                      tag.color && !isActive
                        ? {
                            backgroundColor: `${tag.color}15`,
                            color: tag.color,
                            borderColor: tag.color,
                            borderWidth: '1px',
                          }
                        : {}
                    }
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
