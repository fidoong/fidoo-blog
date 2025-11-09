'use client';

import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '@/lib/api/tags';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostList } from '@/components/post/PostList';
import { Tag as TagIcon, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';

const SidebarDynamic = dynamic(
  () => import('@/components/layout/Sidebar').then((mod) => ({ default: mod.Sidebar })),
  {
    ssr: true,
  },
);

export default function TagsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTagName = searchParams.get('tag');

  // 获取所有标签
  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  });

  // 获取选中的标签信息
  const selectedTag = useMemo(() => {
    if (!selectedTagName || !tagsData) return null;
    return tagsData.find(
      (tag) => tag.name === selectedTagName || tag.slug === selectedTagName,
    );
  }, [selectedTagName, tagsData]);

  const tags = tagsData || [];
  // 按字母顺序排序标签
  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));

  const handleTagClick = (tagName: string) => {
    if (selectedTagName === tagName) {
      // 如果点击的是已选中的标签，清除选择
      router.push('/tags');
    } else {
      // 设置选中的标签
      router.push(`/tags?tag=${encodeURIComponent(tagName)}`);
    }
  };

  const handleClearTag = () => {
    router.push('/tags');
  };

  // 根据是否选中标签来决定显示的文章
  const postListParams = useMemo(() => {
    if (selectedTag) {
      return {
        status: 'published' as const,
        page: 1,
        pageSize: 12,
        keyword: selectedTag.name,
      };
    }
    return {
      status: 'published' as const,
      page: 1,
      pageSize: 12,
      sortBy: 'publishedAt' as const,
      sortOrder: 'DESC' as const,
    };
  }, [selectedTag]);

  return (
    <MainLayout>
      <div className="h-full flex bg-white">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full">
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Main Content */}
                <div>
                  {/* 选中的标签提示 */}
                  {selectedTag && (
                    <div className="mb-4 flex items-center gap-2">
                      <div
                        className="px-3 py-1.5 text-sm font-medium rounded-full flex items-center gap-2"
                        style={
                          selectedTag.color
                            ? {
                                backgroundColor: `${selectedTag.color}20`,
                                color: selectedTag.color,
                              }
                            : {
                                backgroundColor: '#e5e7eb',
                                color: '#374151',
                              }
                        }
                      >
                        <TagIcon className="h-3.5 w-3.5" />
                        {selectedTag.name}
                      </div>
                      <button
                        onClick={handleClearTag}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="清除筛选"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* 标签云 */}
                  {tagsLoading ? (
                    <div className="mb-6 flex flex-wrap gap-2">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {sortedTags.map((tag) => {
                          const isSelected =
                            selectedTagName === tag.name || selectedTagName === tag.slug;
                          return (
                            <button
                              key={tag.id}
                              onClick={() => handleTagClick(tag.name)}
                              className={`
                                px-3 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5
                                ${
                                  isSelected
                                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                                    : 'text-gray-700 bg-gray-100 hover:bg-primary-100 hover:text-primary-600'
                                }
                              `}
                              style={
                                !isSelected && tag.color
                                  ? {
                                      backgroundColor: `${tag.color}20`,
                                      color: tag.color,
                                    }
                                  : {}
                              }
                            >
                              <TagIcon className="h-3.5 w-3.5" />
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 文章列表 */}
                  <div>
                    <PostList params={postListParams} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 独立的导航和定制化卡片区域 */}
        <aside className="hidden lg:block w-80 flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <SidebarDynamic />
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
