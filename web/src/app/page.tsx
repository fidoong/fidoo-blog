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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content - 可滚动区域 */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">最新文章</h1>
              <p className="text-gray-600">发现优质技术内容</p>
            </div>
            <PostList params={{ status: 'published', page: 1, pageSize: 12 }} />
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
