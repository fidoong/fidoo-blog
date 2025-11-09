import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/MainLayout';

// 动态导入组件，实现代码分割
const PostList = dynamic(
  () => import('@/components/post/PostList').then((mod) => ({ default: mod.PostList })),
  {
    ssr: true,
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="w-full h-48 bg-gray-200" />
            <div className="p-6">
              <div className="flex gap-2 mb-3">
                <div className="h-6 w-16 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-6 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
);

const Sidebar = dynamic(
  () => import('@/components/layout/Sidebar').then((mod) => ({ default: mod.Sidebar })),
  {
    ssr: true,
    loading: () => (
      <aside className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-16 mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </aside>
    ),
  },
);

export default function HomePage() {
  return (
    <MainLayout>
      <div className="h-full flex bg-white">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full">
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                <PostList params={{ status: 'published' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 独立的导航和定制化卡片区域 */}
        <aside className="hidden lg:block w-80 flex-shrink-0 border-l border-gray-100 bg-white overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <Sidebar />
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
