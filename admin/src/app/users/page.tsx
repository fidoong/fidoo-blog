'use client';

import { useState, type ChangeEvent } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/index';
import Link from 'next/link';

function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, pageSize, keyword],
    queryFn: () => usersApi.getUsers({ page, pageSize, keyword: keyword || undefined }),
  });

  const users = data?.data?.items || [];
  const total = data?.data?.total || 0;

  return (
    <ProtectedRoute requiredPermissions={['users:view']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">用户管理</h1>
              <p className="text-muted-foreground">管理系统用户</p>
            </div>
            <Button asChild>
              <Link href="/users/new">
                <Plus className="mr-2 h-4 w-4" />
                新建用户
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>用户列表</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索用户..."
                      value={keyword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无用户</div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium">用户名</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">邮箱</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">角色</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">状态</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">创建时间</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs font-semibold">
                                    {user.nickname?.[0] || user.username[0]}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{user.nickname || user.username}</div>
                                  <div className="text-sm text-muted-foreground">@{user.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800'
                                    : user.role === 'editor'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {user.role === 'admin' ? '管理员' : user.role === 'editor' ? '编辑' : '用户'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  user.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : user.status === 'inactive'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {user.status === 'active' ? '活跃' : user.status === 'inactive' ? '未激活' : '已封禁'}
                              </span>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/users/${user.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      共 {total} 条记录，第 {page} / {Math.ceil(total / pageSize)} 页
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        上一页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p: number) => p + 1)}
                        disabled={page >= Math.ceil(total / pageSize)}
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default UsersPage;

