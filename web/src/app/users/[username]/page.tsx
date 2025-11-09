'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/lib/api/posts';
import { followsApi } from '@/lib/api/follows';
import { useAuthStore } from '@/store/auth';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostList } from '@/components/post/PostList';
import { User, Calendar, BookOpen, UserPlus, UserCheck } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import Image from 'next/image';

export default function UserPage({
  params,
}: {
  params: Promise<{ username: string }> | { username: string };
}) {
  // 安全地处理 params，可能是 Promise 或已解析的对象
  let username: string;
  if (
    params &&
    typeof params === 'object' &&
    'then' in params &&
    typeof params.then === 'function'
  ) {
    // 是 Promise
    username = use(params as Promise<{ username: string }>).username;
  } else {
    // 已经是解析后的对象
    username = (params as { username: string }).username;
  }
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 通过获取用户文章来获取用户信息
  const { data: postsData } = useQuery({
    queryKey: ['user-posts', username],
    queryFn: () =>
      postsApi.getPosts({
        keyword: username, // 使用keyword搜索，然后在前端过滤
        status: 'published',
        page: 1,
        pageSize: 20,
      }),
    enabled: !!username,
  });

  // 从文章列表中查找匹配的用户
  const user = postsData?.items?.find((post) => post.author.username === username)?.author;

  // 当找到用户时，设置userId
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user]);

  // 检查关注状态
  const { data: followCheckData } = useQuery({
    queryKey: ['follow-check', userId],
    queryFn: () => followsApi.checkFollowing(userId!),
    enabled: !!userId && isAuthenticated && userId !== currentUser?.id,
  });

  // 初始化关注状态
  useEffect(() => {
    if (followCheckData) {
      setIsFollowing(followCheckData.isFollowing);
    }
  }, [followCheckData]);

  // 关注 mutation
  const followMutation = useMutation({
    mutationFn: () => (isFollowing ? followsApi.unfollow(userId!) : followsApi.follow(userId!)),
    onSuccess: (response) => {
      const newIsFollowing = response.isFollowing ?? !isFollowing;
      setIsFollowing(newIsFollowing);
      queryClient.invalidateQueries({ queryKey: ['user-posts', username] });
    },
  });

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
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {user.nickname || user.username}
                    </h1>
                    <p className="text-gray-600 mb-4">@{user.username}</p>
                  </div>
                  {isAuthenticated && userId && userId !== currentUser?.id && (
                    <button
                      onClick={() => followMutation.mutate()}
                      disabled={followMutation.isPending}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4" />
                          已关注
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          关注
                        </>
                      )}
                    </button>
                  )}
                </div>
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
