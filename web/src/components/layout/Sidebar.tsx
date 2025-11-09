'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriesApi } from '@/lib/api/categories';
import { tagsApi } from '@/lib/api/tags';
import Link from 'next/link';
import { TrendingUp, Tag as TagIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Sidebar() {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 获取分类树形结构
  const { data: categoryTreeData } = useQuery({
    queryKey: ['category-tree'],
    queryFn: () => categoriesApi.getCategoryTree(),
  });

  // 获取所有标签（按分类分组）
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  });

  const categoryTree = useMemo(() => {
    return categoryTreeData || [];
  }, [categoryTreeData]);

  // 按分类分组标签
  const tagsByCategory = useMemo(() => {
    const tags = tagsData || [];
    const grouped: Record<string, typeof tags> = {};
    tags.forEach((tag) => {
      const categoryId = tag.categoryId || 'uncategorized';
      if (!grouped[categoryId]) {
        grouped[categoryId] = [];
      }
      grouped[categoryId].push(tag);
    });
    return grouped;
  }, [tagsData]);

  // 检查当前路径是否是分类页面
  const isCategoryPage = pathname?.startsWith('/categories/');
  const currentCategorySlug = isCategoryPage ? pathname.split('/')[2] : null;

  // 检查当前路径是否是标签页面
  const isTagPage = pathname?.startsWith('/tags/');
  const currentTagSlug = isTagPage ? pathname.split('/')[2] : null;

  // 获取当前标签（如果当前在标签页面）
  const { data: currentTagData } = useQuery({
    queryKey: ['tag', currentTagSlug],
    queryFn: () => (currentTagSlug ? tagsApi.getTagBySlug(currentTagSlug) : Promise.resolve(null)),
    enabled: !!currentTagSlug,
  });

  const currentTag = currentTagData;

  // 如果当前在标签页面，根据标签的 categoryId 找到对应的分类，保持分类的选中状态
  const activeCategorySlug = useMemo(() => {
    if (currentCategorySlug) {
      return currentCategorySlug;
    }
    // 如果在标签页面，根据标签的 categoryId 找到对应的分类
    if (currentTag?.categoryId && categoryTree.length > 0) {
      // 在所有分类中查找包含该 categoryId 的分类
      for (const mainCategory of categoryTree) {
        // 检查是否是子分类
        const subCategory = mainCategory.children?.find(
          (child) => child.id === currentTag.categoryId,
        );
        if (subCategory) {
          return subCategory.slug;
        }
        // 检查是否是大类本身
        if (mainCategory.id === currentTag.categoryId) {
          return mainCategory.slug;
        }
      }
    }
    return null;
  }, [currentCategorySlug, currentTag, categoryTree]);

  // 检测当前是否在大类页面或标签页面，如果是则自动展开对应大类
  useEffect(() => {
    if (activeCategorySlug && categoryTree.length > 0) {
      // 查找当前 slug 对应的大类
      const currentMainCategory = categoryTree.find(
        (cat) => cat.slug === activeCategorySlug && cat.level === 0,
      );

      if (currentMainCategory) {
        // 自动展开当前大类
        setExpandedCategories((prev) => {
          if (prev.has(currentMainCategory.id)) {
            return prev; // 已经展开，不需要更新
          }
          const next = new Set(prev);
          next.add(currentMainCategory.id);
          return next;
        });
      } else {
        // 如果不是大类，查找对应的子分类，然后展开其父分类
        for (const mainCategory of categoryTree) {
          const subCategory = mainCategory.children?.find(
            (child) => child.slug === activeCategorySlug,
          );
          if (subCategory) {
            setExpandedCategories((prev) => {
              if (prev.has(mainCategory.id)) {
                return prev;
              }
              const next = new Set(prev);
              next.add(mainCategory.id);
              return next;
            });
            break;
          }
        }
      }
    }
  }, [activeCategorySlug, categoryTree]);

  // 获取当前大类（如果当前在大类页面或标签页面）
  const currentMainCategory = useMemo(() => {
    if (activeCategorySlug && categoryTree.length > 0) {
      // 先查找大类
      const mainCategory = categoryTree.find(
        (cat) => cat.slug === activeCategorySlug && cat.level === 0,
      );
      if (mainCategory) {
        return mainCategory;
      }
      // 如果不是大类，查找子分类的父分类
      for (const mainCat of categoryTree) {
        const subCategory = mainCat.children?.find((child) => child.slug === activeCategorySlug);
        if (subCategory) {
          return mainCat;
        }
      }
    }
    return null;
  }, [activeCategorySlug, categoryTree]);

  // 获取当前大类下的所有标签
  const currentMainCategoryTags = useMemo(() => {
    if (!currentMainCategory) return [];

    const subCategoryIds = currentMainCategory.children?.map((child) => child.id) || [];
    const allTags = tagsData || [];

    // 收集所有子分类的标签
    return allTags.filter((tag) => {
      if (tag.categoryId && subCategoryIds.includes(tag.categoryId)) {
        return true;
      }
      // 也包含未分类的通用标签
      if (!tag.categoryId) {
        return true;
      }
      return false;
    });
  }, [currentMainCategory, tagsData]);

  // 切换分类展开/收起
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <aside className="space-y-6 max-h-[calc(100vh-5rem)] overflow-y-auto lg:overflow-y-visible custom-scrollbar">
      {/* Categories Tree */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
          <div className="p-1.5 bg-primary-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-primary-600" />
          </div>
          文章分类
        </h3>
        <div className="space-y-1 max-h-[calc(50vh-12rem)] overflow-y-auto custom-scrollbar -mr-1 pr-2">
          {categoryTree.length === 0 ? (
            <div className="text-sm text-gray-400 py-2">暂无分类</div>
          ) : (
            // 始终显示所有分类树，让用户可以看到完整的分类结构
            categoryTree.map((mainCategory, mainIndex) => {
              const isExpanded =
                expandedCategories.has(mainCategory.id) ||
                currentMainCategory?.id === mainCategory.id;
              const hasChildren = mainCategory.children && mainCategory.children.length > 0;
              const isMainActive = activeCategorySlug === mainCategory.slug;

              return (
                <div key={mainCategory.id} className="space-y-1">
                  {/* 大类 */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: mainIndex * 0.03 }}
                    className="flex items-center gap-2"
                  >
                    {hasChildren && (
                      <button
                        onClick={() => toggleCategory(mainCategory.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    )}
                    <Link
                      href={`/categories?category=${encodeURIComponent(mainCategory.slug)}`}
                      className={cn(
                        'flex-1 flex items-center justify-between text-sm py-2 px-3 rounded-lg transition-all duration-200 group',
                        isMainActive
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {mainCategory.icon && (
                          <span className="text-base">{mainCategory.icon}</span>
                        )}
                        <span>{mainCategory.name}</span>
                      </span>
                    </Link>
                  </motion.div>

                  {/* 子分类 */}
                  <AnimatePresence>
                    {hasChildren && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-6 space-y-1"
                      >
                        {mainCategory.children?.map((subCategory, subIndex) => {
                          const isSubActive = activeCategorySlug === subCategory.slug;
                          const categoryTags = tagsByCategory[subCategory.id] || [];

                          return (
                            <div key={subCategory.id} className="space-y-1">
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: subIndex * 0.02 }}
                              >
                                <Link
                                  href={`/categories?category=${encodeURIComponent(subCategory.slug)}`}
                                  className={cn(
                                    'flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg transition-all duration-200',
                                    isSubActive
                                      ? 'bg-primary-50 text-primary-600 font-medium'
                                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600',
                                  )}
                                >
                                  <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                                  <span>{subCategory.name}</span>
                                </Link>
                              </motion.div>

                              {/* 该分类下的标签 */}
                              {categoryTags.length > 0 && (
                                <div className="ml-4 flex flex-wrap gap-1.5">
                                  {categoryTags.slice(0, 5).map((tag) => {
                                    const isTagActive = currentTagSlug === tag.slug;
                                    return (
                                      <Link
                                        key={tag.id}
                                        href={`/tags?tag=${encodeURIComponent(tag.name)}`}
                                        className={cn(
                                          'inline-flex items-center px-2 py-0.5 text-xs rounded-full transition-all',
                                          isTagActive
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                                        )}
                                      >
                                        {tag.name}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tags - 显示热门标签，如果在大类页面则优先显示该大类的标签 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
          <div className="p-1.5 bg-primary-50 rounded-lg">
            <TagIcon className="h-4 w-4 text-primary-600" />
          </div>
          {currentMainCategory ? `${currentMainCategory.name} - 标签` : '热门标签'}
        </h3>
        <div className="flex flex-wrap gap-2 max-h-[calc(50vh-12rem)] overflow-y-auto custom-scrollbar -mr-1 pr-2">
          {(() => {
            // 如果在大类页面，优先显示该大类的标签，否则显示所有热门标签
            const allTags = tagsData || [];
            const displayTags =
              currentMainCategory && currentMainCategoryTags.length > 0
                ? currentMainCategoryTags
                : allTags;

            if (displayTags.length === 0) {
              return <span className="text-sm text-gray-400">暂无标签</span>;
            }

            return displayTags.slice(0, 30).map((tag, index) => {
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
                    href={`/tags?tag=${encodeURIComponent(tag.name)}`}
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
            });
          })()}
        </div>
      </div>
    </aside>
  );
}
