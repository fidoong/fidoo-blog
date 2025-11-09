'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsApi, type Permission, type CreatePermissionDto } from '@/lib/api/permissions';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function PermissionsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      return await permissionsApi.getPermissions();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePermissionDto) => permissionsApi.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setIsCreateOpen(false);
      toast.success('权限创建成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePermissionDto> }) =>
      permissionsApi.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setEditingPermission(null);
      toast.success('权限更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => permissionsApi.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('权限删除成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除失败');
    },
  });

  const handleDelete = (permission: Permission) => {
    if (confirm(`确定要删除权限 "${permission.name}" 吗？`)) {
      deleteMutation.mutate(permission.id);
    }
  };

  // 按类型分组
  const groupedPermissions = (Array.isArray(data) ? data : []).reduce((acc, perm) => {
    const type = perm.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const typeLabels: Record<string, string> = {
    menu: '菜单权限',
    button: '按钮权限',
    api: 'API权限',
    data: '数据权限',
  };

  return (
    <ProtectedRoute requiredPermissions={['permissions:view']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">权限管理</h1>
              <p className="text-muted-foreground">管理系统权限点</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新建权限
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>创建权限</DialogTitle>
                  <DialogDescription>创建一个新的系统权限</DialogDescription>
                </DialogHeader>
                <PermissionForm
                  onSubmit={(data) => {
                    createMutation.mutate(data);
                  }}
                  onCancel={() => setIsCreateOpen(false)}
                  loading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">加载中...</div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedPermissions).map(([type, permissions]) => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle>{typeLabels[type] || type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{permission.name}</h3>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  permission.status === 'enabled'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {permission.status === 'enabled' ? '启用' : '禁用'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              编码: {permission.code}
                              {permission.resource && (
                                <span className="ml-4">资源: {permission.resource}</span>
                              )}
                              {permission.action && (
                                <span className="ml-4">操作: {permission.action}</span>
                              )}
                            </p>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPermission(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(permission)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {editingPermission && (
            <Dialog open={!!editingPermission} onOpenChange={() => setEditingPermission(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>编辑权限</DialogTitle>
                  <DialogDescription>修改权限信息</DialogDescription>
                </DialogHeader>
                <PermissionForm
                  permission={editingPermission}
                  onSubmit={(data) => {
                    updateMutation.mutate({ id: editingPermission.id, data });
                  }}
                  onCancel={() => setEditingPermission(null)}
                  loading={updateMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

interface PermissionFormProps {
  permission?: Permission;
  onSubmit: (data: CreatePermissionDto) => void;
  onCancel: () => void;
  loading: boolean;
}

function PermissionForm({ permission, onSubmit, onCancel, loading }: PermissionFormProps) {
  const [formData, setFormData] = useState<CreatePermissionDto>({
    name: permission?.name || '',
    code: permission?.code || '',
    type: permission?.type || 'api',
    resource: permission?.resource || '',
    action: permission?.action || '',
    path: permission?.path || '',
    method: permission?.method || '',
    status: permission?.status || 'enabled',
    description: permission?.description || '',
    sortOrder: permission?.sortOrder || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">权限名称 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="code">权限编码 *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            disabled={loading || !!permission}
            placeholder="users:create"
          />
          <p className="text-xs text-muted-foreground mt-1">
            格式: 资源:操作，如 users:create
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">权限类型 *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'menu' | 'button' | 'api' | 'data') =>
              setFormData({ ...formData, type: value })
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="menu">菜单权限</SelectItem>
              <SelectItem value="button">按钮权限</SelectItem>
              <SelectItem value="api">API权限</SelectItem>
              <SelectItem value="data">数据权限</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">状态</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'enabled' | 'disabled') =>
              setFormData({ ...formData, status: value })
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enabled">启用</SelectItem>
              <SelectItem value="disabled">禁用</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="resource">资源标识</Label>
          <Input
            id="resource"
            value={formData.resource}
            onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
            disabled={loading}
            placeholder="users"
          />
        </div>

        <div>
          <Label htmlFor="action">操作标识</Label>
          <Input
            id="action"
            value={formData.action}
            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            disabled={loading}
            placeholder="create"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="path">API路径</Label>
          <Input
            id="path"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            disabled={loading}
            placeholder="/api/v1/users"
          />
        </div>

        <div>
          <Label htmlFor="method">HTTP方法</Label>
            <Select
              value={formData.method || 'none'}
              onValueChange={(value) =>
                setFormData({ ...formData, method: value === 'none' ? undefined : value })
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择方法" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="sortOrder">排序</Label>
        <Input
          id="sortOrder"
          type="number"
          value={formData.sortOrder}
          onChange={(e) =>
            setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
          }
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
}

export default PermissionsPage;

