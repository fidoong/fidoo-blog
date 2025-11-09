'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '@/lib/api/system';
import { FileText, Users, MessageSquare, FolderTree } from 'lucide-react';

function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // 使用真实的 API 调用
      return systemApi.getDashboardStats();
    },
  });

  const statCards = [
    {
      title: '文章总数',
      value: stats?.totalPosts || 0,
      description: `已发布: ${stats?.publishedPosts || 0} | 草稿: ${stats?.draftPosts || 0}`,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: '用户总数',
      value: stats?.totalUsers || 0,
      description: `活跃用户: ${stats?.activeUsers || 0}`,
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: '评论总数',
      value: stats?.totalComments || 0,
      description: `待审核: ${stats?.pendingComments || 0}`,
      icon: MessageSquare,
      color: 'text-orange-600',
    },
    {
      title: '分类标签',
      value: `${stats?.totalCategories || 0} / ${stats?.totalTags || 0}`,
      description: '分类 / 标签',
      icon: FolderTree,
      color: 'text-purple-600',
    },
  ];

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">仪表盘</h1>
            <p className="text-muted-foreground">欢迎回来，这里是系统概览</p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 w-24 bg-muted rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <CardDescription className="text-xs mt-1">{stat.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>最近文章</CardTitle>
                <CardDescription>最近发布的文章列表</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">暂无数据</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>系统信息</CardTitle>
                <CardDescription>服务器运行状态</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">暂无数据</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default DashboardPage;

