'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostList } from '@/components/post/PostList';
import { User, Mail, Calendar, BookOpen } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (profileData?.data) {
      setUser(profileData.data);
    }
  }, [profileData, setUser]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayUser = profileData?.data || user;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {displayUser.avatar ? (
                  <Image
                    src={displayUser.avatar}
                    alt={displayUser.nickname || displayUser.username}
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
                  {displayUser.nickname || displayUser.username}
                </h1>
                <p className="text-gray-600 mb-4">@{displayUser.username}</p>
                {displayUser.bio && <p className="text-gray-700 mb-4">{displayUser.bio}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{displayUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>加入于 {formatRelativeTime(displayUser.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Posts */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-600" />
              我的文章
            </h2>
            <PostList
              params={{
                authorId: displayUser.id,
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
