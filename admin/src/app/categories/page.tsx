'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api/categories';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const categories = data || [];

  return (
    <ProtectedRoute requiredPermissions={['categories:view']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">分类管理</h1>
              <p className="text-muted-foreground">管理文章分类</p>
            </div>
            <Button asChild>
              <Link href="/categories/new">
                <Plus className="mr-2 h-4 w-4" />
                新建分类
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>分类列表</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无分类</div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {category.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/categories/${category.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
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

export default CategoriesPage;
