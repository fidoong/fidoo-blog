'use client';

import { useState, type ChangeEvent } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/lib/api/posts';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils/index';
import Link from 'next/link';

function PostsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['posts', page, pageSize, keyword],
    queryFn: () => postsApi.getPosts({ page, pageSize, keyword: keyword || undefined }),
  });

  const posts = data?.items || [];
  const total = data?.total || 0;

  return (
    <ProtectedRoute requiredPermissions={['posts:view']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">文章管理</h1>
              <p className="text-muted-foreground">管理和编辑所有文章</p>
            </div>
            <Button asChild>
              <Link href="/posts/new">
                <Plus className="mr-2 h-4 w-4" />
                新建文章
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>文章列表</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索文章..."
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
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无文章</div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium">标题</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">作者</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">状态</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">浏览量</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">创建时间</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.map((post) => (
                          <tr
                            key={post.id}
                            className="border-b transition-colors hover:bg-muted/50"
                          >
                            <td className="p-4">
                              <div className="font-medium">{post.title}</div>
                              {post.summary && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {post.summary.substring(0, 50)}...
                                </div>
                              )}
                            </td>
                            <td className="p-4">{post.author.nickname || post.author.username}</td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  post.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : post.status === 'draft'
                                      ? 'bg-gray-100 text-gray-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {post.status === 'published'
                                  ? '已发布'
                                  : post.status === 'draft'
                                    ? '草稿'
                                    : '已归档'}
                              </span>
                            </td>
                            <td className="p-4">{post.viewCount}</td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {formatDate(post.createdAt)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/posts/${post.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/posts/${post.id}/edit`}>
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

export default PostsPage;
