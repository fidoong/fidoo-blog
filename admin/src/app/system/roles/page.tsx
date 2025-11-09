'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, type Role, type CreateRoleDto } from '@/lib/api/roles';
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

function RolesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await rolesApi.getRoles();
      // 确保返回的是数组
      let roles = response.data;

      // 如果 response.data 不是数组，可能是嵌套结构，尝试访问 response.data.data
      if (!Array.isArray(roles) && roles && typeof roles === 'object' && 'data' in roles) {
        roles = (roles as { data: Role[] }).data;
      }

      // 确保返回数组
      return Array.isArray(roles) ? roles : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleDto) => rolesApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsCreateOpen(false);
      toast.success('角色创建成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRoleDto> }) =>
      rolesApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
      toast.success('角色更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('角色删除成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除失败');
    },
  });

  const handleDelete = (role: Role) => {
    if (role.isSystem) {
      toast.error('系统角色不能删除');
      return;
    }
    if (confirm(`确定要删除角色 "${role.name}" 吗？`)) {
      deleteMutation.mutate(role.id);
    }
  };

  return (
    <ProtectedRoute requiredPermissions={['roles:view']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">角色管理</h1>
              <p className="text-muted-foreground">管理系统角色和权限分配</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新建角色
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>创建角色</DialogTitle>
                  <DialogDescription>创建一个新的系统角色</DialogDescription>
                </DialogHeader>
                <RoleForm
                  onSubmit={(data) => {
                    createMutation.mutate(data);
                  }}
                  onCancel={() => setIsCreateOpen(false)}
                  loading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>角色列表</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : !Array.isArray(data) || data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无角色</div>
              ) : (
                <div className="space-y-4">
                  {data.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{role.name}</h3>
                            {role.isSystem && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                系统角色
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                role.status === 'enabled'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {role.status === 'enabled' ? '启用' : '禁用'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {role.description || '暂无描述'}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>编码: {role.code}</span>
                            <span>
                              权限: {role.rolePermissions?.length || 0} 个
                            </span>
                            <span>菜单: {role.roleMenus?.length || 0} 个</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(role)}
                          disabled={role.isSystem}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {editingRole && (
            <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>编辑角色</DialogTitle>
                  <DialogDescription>修改角色信息和权限分配</DialogDescription>
                </DialogHeader>
                <RoleForm
                  role={editingRole}
                  onSubmit={(data) => {
                    updateMutation.mutate({ id: editingRole.id, data });
                  }}
                  onCancel={() => setEditingRole(null)}
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

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: CreateRoleDto) => void;
  onCancel: () => void;
  loading: boolean;
}

function RoleForm({ role, onSubmit, onCancel, loading }: RoleFormProps) {
  const [formData, setFormData] = useState<CreateRoleDto>({
    name: role?.name || '',
    code: role?.code || '',
    status: role?.status || 'enabled',
    description: role?.description || '',
    sortOrder: role?.sortOrder || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">角色名称 *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="code">角色编码 *</Label>
        <Input
          id="code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          required
          disabled={loading || role?.isSystem}
          placeholder="如: admin, editor"
        />
        <p className="text-xs text-muted-foreground mt-1">
          唯一标识，创建后不可修改（系统角色不可修改）
        </p>
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

export default RolesPage;

