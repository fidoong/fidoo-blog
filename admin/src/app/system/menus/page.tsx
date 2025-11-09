'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menusApi, type Menu, type CreateMenuDto } from '@/lib/api/menus';
import { Plus, Edit, Trash2, Menu as MenuIcon, ChevronRight, ChevronDown } from 'lucide-react';
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

function MenusPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // 默认展开所有菜单
  const expandAll = () => {
    const collectIds = (menus: Menu[]): Set<string> => {
      const ids = new Set<string>();
      menus.forEach((menu) => {
        if (menu.children && menu.children.length > 0) {
          ids.add(menu.id);
          const childIds = collectIds(menu.children);
          childIds.forEach((id) => ids.add(id));
        }
      });
      return ids;
    };
    if (data && Array.isArray(data)) {
      setExpandedMenus(collectIds(data));
    }
  };

  const collapseAll = () => {
    setExpandedMenus(new Set());
  };

  const { data, isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const response = await menusApi.getMenuTree();
      // 确保返回的是数组
      let menus = response.data;

      // 如果 response.data 不是数组，可能是嵌套结构，尝试访问 response.data.data
      if (!Array.isArray(menus) && menus && typeof menus === 'object' && 'data' in menus) {
        menus = (menus as { data: Menu[] }).data;
      }

      // 确保返回数组
      return Array.isArray(menus) ? menus : [];
    },
  });

  // 数据加载后默认展开所有菜单
  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0 && expandedMenus.size === 0) {
      const collectIds = (menuList: Menu[]): Set<string> => {
        const ids = new Set<string>();
        menuList.forEach((m) => {
          if (m.children && m.children.length > 0) {
            ids.add(m.id);
            const childIds = collectIds(m.children);
            childIds.forEach((id) => ids.add(id));
          }
        });
        return ids;
      };
      setExpandedMenus(collectIds(data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const createMutation = useMutation({
    mutationFn: (data: CreateMenuDto) => menusApi.createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      setIsCreateOpen(false);
      toast.success('菜单创建成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMenuDto> }) =>
      menusApi.updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      setEditingMenu(null);
      toast.success('菜单更新成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menusApi.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success('菜单删除成功');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除失败');
    },
  });

  const handleDelete = (menu: Menu) => {
    if (menu.children && menu.children.length > 0) {
      toast.error('存在子菜单，无法删除');
      return;
    }
    if (confirm(`确定要删除菜单 "${menu.title || menu.name}" 吗？`)) {
      deleteMutation.mutate(menu.id);
    }
  };

  const toggleExpand = (menuId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const renderMenuTree = (menus: Menu[], level = 0, parentPath: string[] = []) => {
    return menus.map((menu, index) => {
      const hasChildren = menu.children && menu.children.length > 0;
      const isExpanded = expandedMenus.has(menu.id);
      const isLast = index === menus.length - 1;
      const currentPath = [...parentPath, menu.id];

      return (
        <div key={menu.id} className="relative">
          {/* 连接线 */}
          {level > 0 && (
            <div
              className="absolute left-0 top-0 bottom-0 w-6 border-l border-gray-300"
              style={{ marginLeft: `${(level - 1) * 24}px` }}
            />
          )}
          {level > 0 && !isLast && (
            <div
              className="absolute left-0 top-6 bottom-0 w-6 border-l border-gray-300"
              style={{ marginLeft: `${(level - 1) * 24}px` }}
            />
          )}

          <div
            className={`flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors ${
              level > 0 ? 'ml-6' : ''
            }`}
            style={{ marginLeft: level > 0 ? `${level * 24}px` : '0' }}
          >
            <div className="flex items-center gap-3 flex-1">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(menu.id)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  type="button"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {menu.icon ? (
                  <span className="text-primary text-sm">{menu.icon}</span>
                ) : (
                  <MenuIcon className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-base">{menu.title || menu.name}</h3>
                  {menu.code && (
                    <span className="text-xs text-muted-foreground">({menu.code})</span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                      menu.status === 'enabled'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {menu.status === 'enabled' ? '启用' : '禁用'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 whitespace-nowrap">
                    {menu.type === 'menu' ? '菜单' : menu.type === 'button' ? '按钮' : '外链'}
                  </span>
                  {menu.isHidden && (
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800 whitespace-nowrap">
                      隐藏
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {menu.path && <span>路径: {menu.path}</span>}
                  {menu.permissionCode && <span>权限: {menu.permissionCode}</span>}
                  <span>排序: {menu.sortOrder}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingMenu(menu)}
                title="编辑"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(menu)}
                title="删除"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="mt-1">{renderMenuTree(menu.children || [], level + 1, currentPath)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <ProtectedRoute requiredPermissions={['menus:view']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">菜单管理</h1>
              <p className="text-muted-foreground">管理系统菜单和权限关联</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={expandAll} size="sm">
                展开全部
              </Button>
              <Button variant="outline" onClick={collapseAll} size="sm">
                收起全部
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新建菜单
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>创建菜单</DialogTitle>
                  <DialogDescription>创建一个新的系统菜单</DialogDescription>
                </DialogHeader>
                <MenuForm
                  menus={data || []}
                  onSubmit={(data) => {
                    createMutation.mutate(data);
                  }}
                  onCancel={() => setIsCreateOpen(false)}
                  loading={createMutation.isPending}
                />
              </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>菜单列表</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : !data || data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无菜单</div>
              ) : (
                <div className="space-y-2">{renderMenuTree(data)}</div>
              )}
            </CardContent>
          </Card>

          {editingMenu && (
            <Dialog open={!!editingMenu} onOpenChange={() => setEditingMenu(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>编辑菜单</DialogTitle>
                  <DialogDescription>修改菜单信息</DialogDescription>
                </DialogHeader>
                <MenuForm
                  menu={editingMenu}
                  menus={data || []}
                  onSubmit={(data) => {
                    updateMutation.mutate({ id: editingMenu.id, data });
                  }}
                  onCancel={() => setEditingMenu(null)}
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

interface MenuFormProps {
  menu?: Menu;
  menus: Menu[];
  onSubmit: (data: CreateMenuDto) => void;
  onCancel: () => void;
  loading: boolean;
}

function MenuForm({ menu, menus, onSubmit, onCancel, loading }: MenuFormProps) {
  const [formData, setFormData] = useState<CreateMenuDto>({
    name: menu?.name || '',
    title: menu?.title || '',
    path: menu?.path || '',
    component: menu?.component || '',
    icon: menu?.icon || '',
    code: menu?.code || '',
    type: menu?.type || 'menu',
    parentId: menu?.parentId || undefined,
    sortOrder: menu?.sortOrder || 0,
    status: menu?.status || 'enabled',
    description: menu?.description || '',
    isHidden: menu?.isHidden || false,
    isCache: menu?.isCache || false,
    isExternal: menu?.isExternal || false,
    externalUrl: menu?.externalUrl || '',
    permissionCode: menu?.permissionCode || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // 扁平化菜单树，用于选择父菜单
  const flattenMenus = (menuList: Menu[], excludeIds: Set<string> = new Set()): Menu[] => {
    const result: Menu[] = [];
    menuList.forEach((m) => {
      if (!excludeIds.has(m.id)) {
        result.push(m);
        if (m.children && m.children.length > 0) {
          result.push(...flattenMenus(m.children, excludeIds));
        }
      }
    });
    return result;
  };

  // 获取可选的父菜单（排除自己和子菜单）
  const getAvailableParents = () => {
    if (!menu) {
      return flattenMenus(menus);
    }
    const excludeIds = new Set([menu.id]);
    const collectChildren = (m: Menu) => {
      if (m.children) {
        m.children.forEach((child) => {
          excludeIds.add(child.id);
          collectChildren(child);
        });
      }
    };
    collectChildren(menu);
    return flattenMenus(menus, excludeIds);
  };

  // 获取菜单的层级路径（用于显示）
  const getMenuPath = (menuId: string, menuList: Menu[], path: string[] = []): string[] | null => {
    for (const m of menuList) {
      const currentPath = [...path, m.title || m.name];
      if (m.id === menuId) {
        return currentPath;
      }
      if (m.children && m.children.length > 0) {
        const found = getMenuPath(menuId, m.children, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">菜单名称 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="title">显示标题</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">菜单编码</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            disabled={loading}
            placeholder="如: menu:dashboard"
          />
        </div>

        <div>
          <Label htmlFor="type">菜单类型</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'menu' | 'button' | 'link') =>
              setFormData({ ...formData, type: value })
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="menu">菜单</SelectItem>
              <SelectItem value="button">按钮</SelectItem>
              <SelectItem value="link">外链</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="path">路由路径</Label>
          <Input
            id="path"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            disabled={loading}
            placeholder="/dashboard"
          />
        </div>

        <div>
          <Label htmlFor="component">组件路径</Label>
          <Input
            id="component"
            value={formData.component}
            onChange={(e) => setFormData({ ...formData, component: e.target.value })}
            disabled={loading}
            placeholder="dashboard"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="parentId">父菜单</Label>
        <Select
          value={formData.parentId || 'none'}
          onValueChange={(value) =>
            setFormData({ ...formData, parentId: value === 'none' ? undefined : value })
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="无（顶级菜单）" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="none">无（顶级菜单）</SelectItem>
            {getAvailableParents().map((m) => {
              const path = getMenuPath(m.id, menus);
              const displayText = path ? path.join(' / ') : m.title || m.name;
              return (
                <SelectItem key={m.id} value={m.id}>
                  {displayText}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          选择父菜单后，当前菜单将作为子菜单显示
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="icon">图标</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            disabled={loading}
            placeholder="LayoutDashboard"
          />
        </div>

        <div>
          <Label htmlFor="sortOrder">排序</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            disabled={loading}
          />
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

      <div>
        <Label htmlFor="permissionCode">权限编码</Label>
        <Input
          id="permissionCode"
          value={formData.permissionCode}
          onChange={(e) => setFormData({ ...formData, permissionCode: e.target.value })}
          disabled={loading}
          placeholder="users:view"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isHidden"
            checked={formData.isHidden}
            onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
            disabled={loading}
            className="rounded"
          />
          <Label htmlFor="isHidden" className="cursor-pointer">
            隐藏菜单
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isCache"
            checked={formData.isCache}
            onChange={(e) => setFormData({ ...formData, isCache: e.target.checked })}
            disabled={loading}
            className="rounded"
          />
          <Label htmlFor="isCache" className="cursor-pointer">
            缓存页面
          </Label>
        </div>
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

export default MenusPage;
