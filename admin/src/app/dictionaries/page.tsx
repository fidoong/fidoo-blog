'use client';

import { useState, type ChangeEvent } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  dictionariesApi,
  type Dictionary,
  type CreateDictionaryDto,
  type QueryDictionaryParams,
} from '@/lib/api/dictionaries';
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils/index';

function DictionariesPage() {
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<'tree' | 'dict' | ''>('');
  const [statusFilter, setStatusFilter] = useState<'enabled' | 'disabled' | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDictionary, setSelectedDictionary] = useState<Dictionary | null>(null);
  const [formData, setFormData] = useState<CreateDictionaryDto>({
    name: '',
    code: '',
    type: 'dict',
    parentId: undefined,
    label: '',
    value: '',
    sortOrder: 0,
    status: 'enabled',
    description: '',
    isSystem: false,
  });

  const queryClient = useQueryClient();

  // 构建查询参数
  const queryParams: QueryDictionaryParams = {
    page,
    pageSize,
    keyword: keyword || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    sortBy: 'sortOrder',
    sortOrder: 'ASC',
  };

  const { data: dictionariesData, isLoading } = useQuery({
    queryKey: ['dictionaries', queryParams],
    queryFn: () => dictionariesApi.getDictionaries(queryParams),
  });

  const { data: treeData } = useQuery({
    queryKey: ['dictionaries-tree'],
    queryFn: () => dictionariesApi.getDictionaryTree(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDictionaryDto) => dictionariesApi.createDictionary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries-tree'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDictionaryDto> }) =>
      dictionariesApi.updateDictionary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries-tree'] });
      setIsEditDialogOpen(false);
      setSelectedDictionary(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dictionariesApi.deleteDictionary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries-tree'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'dict',
      parentId: undefined,
      label: '',
      value: '',
      sortOrder: 0,
      status: 'enabled',
      description: '',
      isSystem: false,
    });
  };

  const handleCreate = () => {
    resetForm();
    setSelectedDictionary(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (dictionary: Dictionary) => {
    setSelectedDictionary(dictionary);
    setFormData({
      name: dictionary.name,
      code: dictionary.code,
      type: dictionary.type,
      parentId: dictionary.parentId || undefined,
      label: dictionary.label || '',
      value: dictionary.value || '',
      sortOrder: dictionary.sortOrder,
      status: dictionary.status,
      description: dictionary.description || '',
      isSystem: dictionary.isSystem,
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (dictionary: Dictionary) => {
    setSelectedDictionary(dictionary);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个字典吗？')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSubmit = () => {
    if (selectedDictionary) {
      updateMutation.mutate({ id: selectedDictionary.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // 获取可选的父字典列表（排除自己和子节点）
  const getAvailableParents = (excludeId?: string): Dictionary[] => {
    if (!treeData) return [];
    const flatten = (dicts: Dictionary[]): Dictionary[] => {
      const result: Dictionary[] = [];
      dicts.forEach((dict) => {
        if (dict.id !== excludeId) {
          result.push(dict);
          if (dict.children) {
            result.push(...flatten(dict.children));
          }
        }
      });
      return result;
    };
    return flatten(treeData);
  };

  const handleSearch = () => {
    setPage(1); // 重置到第一页
  };

  const handleFilterChange = () => {
    setPage(1); // 重置到第一页
  };

  return (
    <ProtectedRoute requiredPermissions={['dictionaries:view']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">字典管理</h1>
              <p className="text-muted-foreground">管理系统数据字典</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              新建字典
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>字典列表</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索字典（名称、编码、标签）..."
                      value={keyword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select
                    value={typeFilter || 'all'}
                    onValueChange={(value) => {
                      setTypeFilter(value === 'all' ? '' : (value as 'tree' | 'dict'));
                      handleFilterChange();
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="dict">字典</SelectItem>
                      <SelectItem value="tree">树形</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) => {
                      setStatusFilter(value === 'all' ? '' : (value as 'enabled' | 'disabled'));
                      handleFilterChange();
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="enabled">启用</SelectItem>
                      <SelectItem value="disabled">禁用</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleSearch}>
                    <Search className="mr-2 h-4 w-4" />
                    搜索
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : !dictionariesData || dictionariesData.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无字典</div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium">名称</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">编码</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">类型</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">标签/值</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">状态</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">创建时间</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dictionariesData.items.map((dict) => (
                          <tr
                            key={dict.id}
                            className="border-b transition-colors hover:bg-muted/50"
                          >
                            <td className="p-4">
                              <div className="font-medium">{dict.name}</div>
                              {dict.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {dict.description.substring(0, 50)}...
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {dict.code}
                              </code>
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  dict.type === 'tree'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {dict.type === 'tree' ? '树形' : '字典'}
                              </span>
                            </td>
                            <td className="p-4">
                              {dict.label && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">标签:</span> {dict.label}
                                </div>
                              )}
                              {dict.value && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">值:</span> {dict.value}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  dict.status === 'enabled'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {dict.status === 'enabled' ? '启用' : '禁用'}
                              </span>
                              {dict.isSystem && (
                                <span className="ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800">
                                  系统
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {formatDate(dict.createdAt)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleView(dict)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(dict)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(dict.id)}
                                  disabled={dict.isSystem}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* 分页 */}
                  {dictionariesData && dictionariesData.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        共 {dictionariesData.total} 条，第 {dictionariesData.page} /{' '}
                        {dictionariesData.totalPages} 页
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={!dictionariesData.hasPrevious}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          上一页
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((p) => Math.min(dictionariesData.totalPages, p + 1))
                          }
                          disabled={!dictionariesData.hasNext}
                        >
                          下一页
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 创建/编辑对话框 */}
          <Dialog
            open={isCreateDialogOpen || isEditDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
                setSelectedDictionary(null);
              }
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedDictionary ? '编辑字典' : '新建字典'}</DialogTitle>
                <DialogDescription>
                  {selectedDictionary ? '修改字典信息' : '创建一个新的数据字典'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">名称 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="字典名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">编码 *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="字典编码（唯一）"
                      disabled={!!selectedDictionary}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">类型</Label>
                    <Select
                      value={formData.type || 'dict'}
                      onValueChange={(value: 'tree' | 'dict') =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dict">字典</SelectItem>
                        <SelectItem value="tree">树形</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentId">父字典</Label>
                    <Select
                      value={formData.parentId || 'none'}
                      onValueChange={(value) =>
                        setFormData({ ...formData, parentId: value === 'none' ? undefined : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择父字典（可选）" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无</SelectItem>
                        {getAvailableParents(selectedDictionary?.id).map((dict) => (
                          <SelectItem key={dict.id} value={dict.id}>
                            {dict.name} ({dict.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">标签</Label>
                    <Input
                      id="label"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="显示标签"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">值</Label>
                    <Input
                      id="value"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="字典值"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">排序</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">状态</Label>
                    <Select
                      value={formData.status || 'enabled'}
                      onValueChange={(value: 'enabled' | 'disabled') =>
                        setFormData({ ...formData, status: value })
                      }
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
                <div className="space-y-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="字典描述"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    resetForm();
                    setSelectedDictionary(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {selectedDictionary ? '更新' : '创建'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 查看对话框 */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>字典详情</DialogTitle>
                <DialogDescription>查看字典的详细信息</DialogDescription>
              </DialogHeader>
              {selectedDictionary && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>名称</Label>
                      <div className="mt-1">{selectedDictionary.name}</div>
                    </div>
                    <div>
                      <Label>编码</Label>
                      <div className="mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {selectedDictionary.code}
                        </code>
                      </div>
                    </div>
                    <div>
                      <Label>类型</Label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            selectedDictionary.type === 'tree'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {selectedDictionary.type === 'tree' ? '树形' : '字典'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>状态</Label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            selectedDictionary.status === 'enabled'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedDictionary.status === 'enabled' ? '启用' : '禁用'}
                        </span>
                      </div>
                    </div>
                    {selectedDictionary.label && (
                      <div>
                        <Label>标签</Label>
                        <div className="mt-1">{selectedDictionary.label}</div>
                      </div>
                    )}
                    {selectedDictionary.value && (
                      <div>
                        <Label>值</Label>
                        <div className="mt-1">{selectedDictionary.value}</div>
                      </div>
                    )}
                    <div>
                      <Label>排序</Label>
                      <div className="mt-1">{selectedDictionary.sortOrder}</div>
                    </div>
                    <div>
                      <Label>系统字典</Label>
                      <div className="mt-1">{selectedDictionary.isSystem ? '是' : '否'}</div>
                    </div>
                  </div>
                  {selectedDictionary.description && (
                    <div>
                      <Label>描述</Label>
                      <div className="mt-1">{selectedDictionary.description}</div>
                    </div>
                  )}
                  {selectedDictionary.extra && (
                    <div>
                      <Label>扩展字段</Label>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(selectedDictionary.extra, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>创建时间</Label>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {formatDate(selectedDictionary.createdAt)}
                      </div>
                    </div>
                    <div>
                      <Label>更新时间</Label>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {formatDate(selectedDictionary.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default DictionariesPage;
