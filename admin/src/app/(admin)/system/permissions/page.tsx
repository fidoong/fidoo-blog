/**
 * 权限管理页面
 */

'use client';

import React from 'react';
import { Table, Modal } from 'antd';
import {
  permissionsApi,
  type Permission,
  type CreatePermissionDto,
  type UpdatePermissionDto,
  type QueryPermissionDto,
  PermissionType,
  PermissionStatus,
} from '@/lib/api/permissions';
import { showFormDialog } from '@/components/form/FormDialog';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection } from '@/hooks';
import { usePermissionsMutation } from '@/hooks/api';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';

// 表单配置
const getFormConfig = (initialValues?: Permission) => ({
  title: initialValues ? '编辑权限' : '创建权限',
  fields: [
    {
      name: 'name',
      label: '权限名称',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.name,
    },
    {
      name: 'code',
      label: '权限编码',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.code,
      disabled: !!initialValues,
    },
    {
      name: 'type',
      label: '权限类型',
      type: 'select' as const,
      required: true,
      options: [
        { label: '菜单', value: PermissionType.MENU },
        { label: '按钮', value: PermissionType.BUTTON },
        { label: 'API', value: PermissionType.API },
        { label: '数据', value: PermissionType.DATA },
      ],
      defaultValue: initialValues?.type,
    },
    {
      name: 'resource',
      label: '资源标识',
      type: 'input' as const,
      defaultValue: initialValues?.resource,
    },
    {
      name: 'action',
      label: '操作标识',
      type: 'input' as const,
      defaultValue: initialValues?.action,
    },
    {
      name: 'path',
      label: 'API路径',
      type: 'input' as const,
      defaultValue: initialValues?.path,
    },
    {
      name: 'method',
      label: 'HTTP方法',
      type: 'select' as const,
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
      ],
      defaultValue: initialValues?.method,
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '启用', value: PermissionStatus.ENABLED },
        { label: '禁用', value: PermissionStatus.DISABLED },
      ],
      defaultValue: initialValues?.status,
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
      name: 'nameLike',
      label: '权限名称',
      type: 'input' as const,
      placeholder: '请输入权限名称',
    },
    {
      name: 'code',
      label: '权限编码',
      type: 'input' as const,
      placeholder: '请输入权限编码',
    },
    {
      name: 'type',
      label: '权限类型',
      type: 'select' as const,
      placeholder: '请选择权限类型',
      options: [
        { label: '全部', value: '' },
        { label: '菜单', value: PermissionType.MENU },
        { label: '按钮', value: PermissionType.BUTTON },
        { label: 'API', value: PermissionType.API },
        { label: '数据', value: PermissionType.DATA },
      ],
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: PermissionStatus.ENABLED },
        { label: '禁用', value: PermissionStatus.DISABLED },
      ],
    },
  ],
  grid: {
    columns: 4,
    gutter: 16,
  },
};

export default function PermissionsPage() {
  // 表格数据管理
  const table = useTable<Permission, QueryPermissionDto & Record<string, unknown>>({
    queryKey: ['permissions'],
    queryFn: async (params) => {
      const result = await permissionsApi.getPermissions(params);
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
  const selection = useTableSelection<Permission>({
    rowKey: 'id',
  });

  // 表格操作
  const mutations = usePermissionsMutation({
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
    table.setParams(params as QueryPermissionDto & Record<string, unknown>);
  };

  // 处理编辑
  const handleEdit = (record: Permission) => {
    showFormDialog({
      ...getFormConfig(record),
      initialValues: record as unknown as Record<string, unknown>,
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.update(record.id, formValues as UpdatePermissionDto);
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
          await mutations.create(formValues as unknown as CreatePermissionDto);
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
      title: '确定要删除这个权限吗？',
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
      title: `确定要删除选中的 ${selection.selectedCount} 个权限吗？`,
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
        title: '权限名称',
        dataIndex: 'name',
        width: 150,
      },
      {
        key: 'code',
        title: '权限编码',
        dataIndex: 'code',
        width: 200,
      },
      {
        key: 'type',
        title: '权限类型',
        dataIndex: 'type',
        width: 100,
        render: (value: PermissionType) => {
          const typeMap: Record<PermissionType, string> = {
            [PermissionType.MENU]: '菜单',
            [PermissionType.BUTTON]: '按钮',
            [PermissionType.API]: 'API',
            [PermissionType.DATA]: '数据',
          };
          return typeMap[value] || value;
        },
      },
      {
        key: 'resource',
        title: '资源标识',
        dataIndex: 'resource',
        width: 120,
      },
      {
        key: 'action',
        title: '操作标识',
        dataIndex: 'action',
        width: 120,
      },
      {
        key: 'status',
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (value: PermissionStatus) => {
          return value === PermissionStatus.ENABLED ? '启用' : '禁用';
        },
      },
      TableActionColumn<Permission>({
        actions: [
          {
            key: 'edit',
            text: '编辑',
            icon: 'EditOutlined',
            permission: 'permissions:update',
            onClick: (record) => handleEdit(record),
          },
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'permissions:delete',
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
        title="搜索权限"
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
              text: '创建权限',
              type: 'primary',
              icon: 'PlusOutlined',
              permission: 'permissions:create',
              onClick: handleCreate,
            },
            {
              key: 'batchDelete',
              text: `批量删除 (${selection.selectedCount})`,
              danger: true,
              icon: 'DeleteOutlined',
              permission: 'permissions:delete',
              disabled: !selection.hasSelected,
              onClick: handleBatchDelete,
            },
          ],
        }}
      />

      <Table
        columns={columns}
        dataSource={table.data}
        loading={table.isLoading}
        rowKey="id"
        pagination={table.pagination}
        rowSelection={selection.rowSelection}
      />
    </>
  );
}

