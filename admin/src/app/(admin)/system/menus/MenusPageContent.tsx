/**
 * 菜单管理页面内容组件
 * 用于代码分割和懒加载
 */

'use client';

import React from 'react';
import { Table, Modal } from 'antd';
import {
  menusApi,
  type Menu,
  type CreateMenuDto,
  type UpdateMenuDto,
  type QueryMenuDto,
  MenuType,
  MenuStatus,
} from '@/lib/api/menus';
import { showFormDialog } from '@/components/form/FormDialog';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection } from '@/hooks';
import { useMenusMutation } from '@/hooks/api';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';
import { TableSkeleton } from '@/components/skeleton';

// 表单配置
const getFormConfig = (initialValues?: Menu) => ({
  title: initialValues ? '编辑菜单' : '创建菜单',
  fields: [
    {
      name: 'name',
      label: '菜单名称',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.name,
    },
    {
      name: 'title',
      label: '显示标题',
      type: 'input' as const,
      defaultValue: initialValues?.title,
    },
    {
      name: 'code',
      label: '菜单编码',
      type: 'input' as const,
      defaultValue: initialValues?.code,
      disabled: !!initialValues,
    },
    {
      name: 'type',
      label: '菜单类型',
      type: 'select' as const,
      required: true,
      options: [
        { label: '菜单', value: MenuType.MENU },
        { label: '按钮', value: MenuType.BUTTON },
        { label: '外链', value: MenuType.EXTERNAL },
      ],
      defaultValue: initialValues?.type,
    },
    {
      name: 'path',
      label: '路由路径',
      type: 'input' as const,
      defaultValue: initialValues?.path,
    },
    {
      name: 'component',
      label: '组件路径',
      type: 'input' as const,
      defaultValue: initialValues?.component,
    },
    {
      name: 'icon',
      label: '图标',
      type: 'input' as const,
      placeholder: '如：UserOutlined',
      defaultValue: initialValues?.icon,
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '启用', value: MenuStatus.ENABLED },
        { label: '禁用', value: MenuStatus.DISABLED },
      ],
      defaultValue: initialValues?.status,
    },
    {
      name: 'sortOrder',
      label: '排序',
      type: 'number' as const,
      defaultValue: initialValues?.sortOrder,
    },
    {
      name: 'isHidden',
      label: '是否隐藏',
      type: 'switch' as const,
      defaultValue: initialValues?.isHidden,
    },
    {
      name: 'isCache',
      label: '是否缓存',
      type: 'switch' as const,
      defaultValue: initialValues?.isCache,
    },
    {
      name: 'description',
      label: '描述',
      type: 'textarea' as const,
      defaultValue: initialValues?.description,
    },
  ],
  layout: 'vertical' as const,
});

// 搜索表单配置
const searchFormConfig = {
  fields: [
    {
      name: 'name',
      label: '菜单名称',
      type: 'input' as const,
      placeholder: '请输入菜单名称',
    },
    {
      name: 'type',
      label: '菜单类型',
      type: 'select' as const,
      placeholder: '请选择菜单类型',
      options: [
        { label: '全部', value: '' },
        { label: '菜单', value: MenuType.MENU },
        { label: '按钮', value: MenuType.BUTTON },
        { label: '外链', value: MenuType.EXTERNAL },
      ],
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: MenuStatus.ENABLED },
        { label: '禁用', value: MenuStatus.DISABLED },
      ],
    },
  ],
  grid: {
    columns: 3,
    gutter: 16,
  },
};

export default function MenusPageContent() {
  // 表格数据管理
  const table = useTable<Menu, QueryMenuDto & Record<string, unknown>>({
    queryKey: ['menus'],
    queryFn: async (params) => {
      const result = await menusApi.getMenus(params);
      if (Array.isArray(result)) {
        return {
          items: result,
          total: result.length,
        };
      }
      return result;
    },
    initialParams: {},
    initialPagination: {
      pageSize: 10,
    },
  });

  // 表格选择
  const selection = useTableSelection<Menu>({
    rowKey: 'id',
  });

  // 表格操作
  const mutations = useMenusMutation({
    refreshMode: 'refetch',
    onSuccess: {
      create: () => {
        table.resetPagination();
      },
      delete: () => {
        const current = table.pagination.current;
        const pageSize = table.pagination.pageSize;
        if (table.data.length === 0 && current && current > 1 && pageSize) {
          table.pagination.onChange?.(current - 1, pageSize);
        }
      },
      batchDelete: () => {
        const current = table.pagination.current;
        const pageSize = table.pagination.pageSize;
        if (table.data.length === 0 && current && current > 1 && pageSize) {
          table.pagination.onChange?.(current - 1, pageSize);
        }
        selection.clearSelection();
      },
    },
  });

  // 处理搜索
  const handleSearch = (values: Record<string, unknown>) => {
    const params: Record<string, unknown> = {};
    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    table.setParams(params as QueryMenuDto & Record<string, unknown>);
  };

  // 处理编辑
  const handleEdit = (record: Menu) => {
    showFormDialog({
      ...getFormConfig(record),
      initialValues: record as unknown as Record<string, unknown>,
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.update(record.id, formValues as UpdateMenuDto);
        },
      },
    })
      .then(() => {
        // 提交成功
      })
      .catch((error) => {
        console.error('编辑失败:', error);
      });
  };

  // 处理创建
  const handleCreate = () => {
    showFormDialog({
      ...getFormConfig(),
      defaultButtons: {
        okText: '创建',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.create(formValues as unknown as CreateMenuDto);
        },
      },
    })
      .then(() => {
        // 提交成功
      })
      .catch((error) => {
        console.error('创建失败:', error);
      });
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确定要删除这个菜单吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await mutations.delete(id);
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
    });
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selection.selectedRowKeys.length === 0) {
      return;
    }

    Modal.confirm({
      title: `确定要删除选中的 ${selection.selectedCount} 个菜单吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await mutations.batchDelete(selection.selectedRowKeys);
          selection.clearSelection();
        } catch (error) {
          console.error('批量删除失败:', error);
        }
      },
    });
  };

  // 表格配置
  const tableConfig: TableSchemaConfig = {
    columns: [
      {
        key: 'name',
        title: '菜单名称',
        dataIndex: 'name',
        width: 150,
      },
      {
        key: 'title',
        title: '显示标题',
        dataIndex: 'title',
        width: 150,
      },
      {
        key: 'code',
        title: '菜单编码',
        dataIndex: 'code',
        width: 150,
      },
      {
        key: 'type',
        title: '类型',
        dataIndex: 'type',
        width: 100,
        render: (value: MenuType) => {
          const typeMap: Record<MenuType, string> = {
            [MenuType.MENU]: '菜单',
            [MenuType.BUTTON]: '按钮',
            [MenuType.EXTERNAL]: '外链',
          };
          return typeMap[value] || value;
        },
      },
      {
        key: 'path',
        title: '路由路径',
        dataIndex: 'path',
        width: 200,
      },
      {
        key: 'status',
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (value: MenuStatus) => {
          return value === MenuStatus.ENABLED ? '启用' : '禁用';
        },
      },
      {
        key: 'sortOrder',
        title: '排序',
        dataIndex: 'sortOrder',
        width: 80,
      },
      TableActionColumn<Menu>({
        actions: [
          {
            key: 'edit',
            text: '编辑',
            icon: 'EditOutlined',
            permission: 'menus:update',
            onClick: (record) => handleEdit(record),
          },
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'menus:delete',
            onClick: (record) => handleDelete(record.id),
          },
        ],
      }),
    ],
    rowKey: 'id',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
    },
  };

  const columns = buildTableColumns(tableConfig);

  return (
    <>
      {/* 搜索表单 */}
      <TableSearchForm
        {...searchFormConfig}
        title="搜索菜单"
        onSubmit={handleSearch}
        onReset={() => {
          table.resetParams();
        }}
      />

      {/* 表格工具栏 */}
      <TableTool
        config={{
          actions: [
            {
              key: 'create',
              text: '创建菜单',
              type: 'primary',
              icon: 'PlusOutlined',
              permission: 'menus:create',
              onClick: handleCreate,
            },
            {
              key: 'batchDelete',
              text: `批量删除 (${selection.selectedCount})`,
              danger: true,
              icon: 'DeleteOutlined',
              permission: 'menus:delete',
              disabled: !selection.hasSelected,
              onClick: handleBatchDelete,
            },
          ],
        }}
      />

      {/* 初始加载时使用骨架屏 */}
      {table.isLoading && table.data.length === 0 ? (
        <TableSkeleton columns={7} rows={5} />
      ) : (
        <Table
          columns={columns}
          dataSource={table.data}
          loading={table.isLoading}
          rowKey="id"
          pagination={table.pagination}
          rowSelection={selection.rowSelection}
        />
      )}
    </>
  );
}
