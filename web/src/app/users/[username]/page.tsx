'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/lib/api/posts';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostList } from '@/components/post/PostList';
import { User, Mail, Calendar, BookOpen } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import Image from 'next/image';

export default function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);

  // 通过获取用户文章来获取用户信息
  const { data: postsData } = useQuery({
    queryKey: ['user-posts', username],
    queryFn: () =>
      postsApi.getPosts({
        authorId: username, // 这里需要后端支持通过username查询
        status: 'published',
        page: 1,
        pageSize: 1,
      }),
    enabled: !!username,
  });

  const user = postsData?.data?.items?.[0]?.author;

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-500">用户不存在</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.nickname || user.username}
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-30 w-30 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-16 w-16 text-primary-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user.nickname || user.username}
                </h1>
                <p className="text-gray-600 mb-4">@{user.username}</p>
                {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>加入于 {formatRelativeTime(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Posts */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-600" />
              文章
            </h2>
            <PostList
              params={{
                authorId: user.id,
                status: 'published',
                page: 1,
                pageSize: 12,
              }}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
