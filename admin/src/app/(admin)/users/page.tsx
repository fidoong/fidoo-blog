/**
 * 用户管理页面 - 基于 Hooks 重构版本
 */

'use client';

import React from 'react';
import { Table, Modal } from 'antd';
import {
  usersApi,
  type User,
  type CreateUserDto,
  type UpdateUserDto,
  type QueryUserDto,
} from '@/lib/api/users';
import { showFormDialog } from '@/components/form/FormDialog';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection } from '@/hooks';
import { useUsersMutation } from '@/hooks/api';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';

// 表单配置
const getFormConfig = (initialValues?: User) => ({
  title: initialValues ? '编辑用户' : '创建用户',
  fields: [
    {
      name: 'username',
      label: '用户名',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.username,
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.email,
    },
    {
      name: 'password',
      label: '密码',
      type: 'input' as const,
      required: !initialValues,
      componentProps: { type: 'password' },
    },
    {
      name: 'nickname',
      label: '昵称',
      type: 'input' as const,
      defaultValue: initialValues?.nickname,
    },
    {
      name: 'role',
      label: '角色',
      type: 'select' as const,
      options: [
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
        { label: '用户', value: 'user' },
      ],
      defaultValue: initialValues?.role,
    },
  ],
  layout: 'vertical' as const,
});

// 搜索表单配置（一行4个字段）
const searchFormConfig = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      type: 'input' as const,
      placeholder: '请输入用户名',
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input' as const,
      placeholder: '请输入邮箱',
    },
    {
      name: 'role',
      label: '角色',
      type: 'select' as const,
      placeholder: '请选择角色',
      options: [
        { label: '全部', value: '' },
        { label: '管理员', value: 'admin' },
        { label: '编辑', value: 'editor' },
        { label: '用户', value: 'user' },
      ],
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ],
    },
  ],
  grid: {
    columns: 4, // 一行4个字段
    gutter: 16, // 字段间距
  },
};

export default function UsersPage() {
  // 1. 表格数据管理（分页、搜索、数据加载）
  // queryFn 是接口调用函数，当查询参数变化时会自动调用
  // useTable 内部使用 React Query 的 useQuery，会自动处理缓存、加载状态等
  const table = useTable<User, QueryUserDto & Record<string, unknown>>({
    queryKey: ['users'], // React Query 的缓存 key
    queryFn: async (params) => {
      // 这里就是实际的接口调用
      // params 包含：page, pageSize, 以及搜索条件（username, email, role, status 等）
      const result = await usersApi.getUsers(params);
      return result; // 返回 PaginatedResponse<User>
    },
    initialParams: {},
    initialPagination: {
      pageSize: 10,
    },
  });

  // 2. 表格选择（批量操作）
  const selection = useTableSelection<User>({
    rowKey: 'id',
  });

  // 3. 表格操作（创建、更新、删除、批量删除）
  const mutations = useUsersMutation({
    refreshMode: 'refetch', // 立即刷新数据
    onSuccess: {
      // 创建后跳转到第一页
      create: () => {
        table.resetPagination();
      },
      // 删除后检查是否需要调整分页
      delete: () => {
        // 如果当前页没有数据了，跳转到上一页
        const current = table.pagination.current;
        const pageSize = table.pagination.pageSize;
        if (table.data.length === 0 && current && current > 1 && pageSize) {
          table.pagination.onChange?.(current - 1, pageSize);
        }
      },
      // 批量删除后检查是否需要调整分页
      batchDelete: () => {
        // 如果当前页没有数据了，跳转到上一页
        const current = table.pagination.current;
        const pageSize = table.pagination.pageSize;
        if (table.data.length === 0 && current && current > 1 && pageSize) {
          table.pagination.onChange?.(current - 1, pageSize);
        }
      },
    },
  });

  // 处理搜索
  const handleSearch = (values: Record<string, unknown>) => {
    // 过滤空值
    const params: Record<string, unknown> = {};
    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    table.setParams(params as QueryUserDto & Record<string, unknown>);
  };

  // 处理编辑
  const handleEdit = (record: User) => {
    showFormDialog({
      ...getFormConfig(record),
      initialValues: record as unknown as Record<string, unknown>,
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...updateData } = formValues;
          await mutations.update(record.id, updateData as UpdateUserDto);
        },
      },
    })
      .then(() => {
        // 提交成功
      })
      .catch((error) => {
        // 提交失败（用户取消不会进入这里，除非设置了 rejectOnCancel: true）
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
          await mutations.create(formValues as unknown as CreateUserDto);
        },
      },
    })
      .then(() => {
        // 提交成功
      })
      .catch((error) => {
        // 提交失败（用户取消不会进入这里，除非设置了 rejectOnCancel: true）
        console.error('创建失败:', error);
      });
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确定要删除这个用户吗？',
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
      title: `确定要删除选中的 ${selection.selectedCount} 个用户吗？`,
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
        key: 'username',
        title: '用户名',
        dataIndex: 'username',
        width: 150,
      },
      {
        key: 'email',
        title: '邮箱',
        dataIndex: 'email',
        width: 200,
      },
      {
        key: 'nickname',
        title: '昵称',
        dataIndex: 'nickname',
        width: 150,
      },
      {
        key: 'role',
        title: '角色',
        dataIndex: 'role',
        width: 100,
      },
      {
        key: 'status',
        title: '状态',
        dataIndex: 'status',
        width: 100,
      },
      TableActionColumn<User>({
        actions: [
          {
            key: 'edit',
            text: '编辑',
            icon: 'EditOutlined',
            permission: 'users:update',
            onClick: (record) => handleEdit(record),
          },
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'users:delete',
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
        title="搜索用户"
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
              text: '创建用户',
              type: 'primary',
              icon: 'PlusOutlined',
              permission: 'users:create',
              onClick: handleCreate,
            },
            {
              key: 'batchDelete',
              text: `批量删除 (${selection.selectedCount})`,
              danger: true,
              icon: 'DeleteOutlined',
              permission: 'users:delete',
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
