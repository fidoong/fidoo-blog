/**
 * 用户管理页面内容组件
 * 用于代码分割和懒加载
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
import { useTable, useTableSelection, useDebounce } from '@/hooks';
import { useUsersMutation } from '@/hooks/api';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';
import { TableSkeleton } from '@/components/skeleton';

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
      componentProps: { placeholder: '请输入用户名' },
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input' as const,
      componentProps: { placeholder: '请输入邮箱' },
    },
    {
      name: 'role',
      label: '角色',
      type: 'select' as const,
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
      options: [
        { label: '全部', value: '' },
        { label: '活跃', value: 'active' },
        { label: '禁用', value: 'inactive' },
        { label: '封禁', value: 'banned' },
      ],
    },
  ],
  layout: 'inline' as const,
  colSpan: 6,
};

// 表格列配置
const tableSchema: TableSchemaConfig<User> = {
  columns: [
    { key: 'id', title: 'ID', dataIndex: 'id', width: 80 },
    { key: 'username', title: '用户名', dataIndex: 'username' },
    { key: 'email', title: '邮箱', dataIndex: 'email' },
    { key: 'nickname', title: '昵称', dataIndex: 'nickname' },
    {
      key: 'role',
      title: '角色',
      dataIndex: 'role',
      render: (value: string) => {
        const roleMap: Record<string, { text: string; color: string }> = {
          admin: { text: '管理员', color: 'red' },
          editor: { text: '编辑', value: 'blue' },
          user: { text: '用户', color: 'default' },
        };
        const role = roleMap[value] || { text: value, color: 'default' };
        return <span style={{ color: role.color }}>{role.text}</span>;
      },
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      render: (value: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          active: { text: '活跃', color: 'green' },
          inactive: { text: '禁用', color: 'orange' },
          banned: { text: '封禁', color: 'red' },
        };
        const status = statusMap[value] || { text: value, color: 'default' };
        return <span style={{ color: status.color }}>{status.text}</span>;
      },
    },
    { key: 'createdAt', title: '创建时间', dataIndex: 'createdAt', width: 180 },
  ],
};

export default function UsersPageContent() {
  // 1. 表格数据管理（分页、搜索、数据加载）
  const table = useTable<User, QueryUserDto & Record<string, unknown>>({
    queryKey: ['users'],
    queryFn: async (params) => {
      const result = await usersApi.getUsers(params);
      return result;
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
      },
    },
  });

  // 搜索值状态
  const [searchValues, setSearchValues] = React.useState<Record<string, unknown>>({});
  const debouncedSearchValues = useDebounce(searchValues, 500);

  // 当搜索值变化时，更新表格查询参数
  React.useEffect(() => {
    table.setParams(debouncedSearchValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValues]);

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
    });
  };

  // 处理编辑
  const handleEdit = (record: User) => {
    showFormDialog({
      ...getFormConfig(record),
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.update(record.id, formValues as unknown as UpdateUserDto);
        },
      },
    });
  };

  // 处理删除
  const handleDelete = (record: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.username}" 吗？`,
      onOk: async () => {
        await mutations.delete(record.id);
      },
    });
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    const selectedRows = selection.selectedRows;
    if (selectedRows.length === 0) {
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRows.length} 个用户吗？`,
      onOk: async () => {
        const ids = selectedRows.map((row) => row.id);
        await mutations.batchDelete(ids);
        selection.clearSelection();
      },
    });
  };

  // 构建表格列
  const columns = buildTableColumns(tableSchema);

  // 初始加载时显示骨架屏
  if (table.isLoading && table.data.length === 0) {
    return <TableSkeleton />;
  }

  return (
    <div>
      <TableTool
        onCreate={handleCreate}
        onBatchDelete={selection.selectedRows.length > 0 ? handleBatchDelete : undefined}
      />
      <TableSearchForm config={searchFormConfig} values={searchValues} onChange={setSearchValues} />
      <Table
        columns={[
          ...columns,
          <TableActionColumn key="actions" onEdit={handleEdit} onDelete={handleDelete} />,
        ]}
        dataSource={table.data}
        loading={table.isLoading}
        rowKey="id"
        rowSelection={selection.rowSelection}
        pagination={table.pagination}
      />
    </div>
  );
}
