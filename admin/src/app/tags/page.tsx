'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '@/lib/api/tags';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

function TagsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getTags(),
  });

  const tags = data || [];

  return (
    <ProtectedRoute requiredPermissions={['tags:view']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">标签管理</h1>
              <p className="text-muted-foreground">管理文章标签</p>
            </div>
            <Button asChild>
              <Link href="/tags/new">
                <Plus className="mr-2 h-4 w-4" />
                新建标签
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>标签列表</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : tags.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无标签</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: tag.color || '#3b82f6' }}
                      />
                      <span className="font-medium">{tag.name}</span>
                      <div className="flex items-center gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                          <Link href={`/tags/${tag.id}/edit`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default TagsPage;

