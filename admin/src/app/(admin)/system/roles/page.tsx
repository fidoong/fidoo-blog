/**
 * 角色管理页面 - 基于 Hooks 重构版本
 */

'use client';

import React from 'react';
import { Table, Modal } from 'antd';
import {
  rolesApi,
  type Role,
  type CreateRoleDto,
  type UpdateRoleDto,
  type QueryRoleDto,
} from '@/lib/api/roles';
import { showFormDialog } from '@/components/form/FormDialog';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection } from '@/hooks';
import { useRolesMutation } from '@/hooks/api';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';

const getFormConfig = (initialValues?: Role) => ({
  title: initialValues ? '编辑角色' : '创建角色',
  fields: [
    {
      name: 'name',
      label: '角色名称',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.name,
    },
    {
      name: 'code',
      label: '角色编码',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.code,
      disabled: !!initialValues,
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

export default function RolesPage() {
  // 1. 表格数据管理（分页、搜索、数据加载）
  const table = useTable<Role, QueryRoleDto & Record<string, unknown>>({
    queryKey: ['roles'],
    queryFn: async (params) => {
      const result = await rolesApi.getRoles(params);
      // 处理返回类型可能是数组或分页响应
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

  // 2. 表格选择（批量操作）
  const selection = useTableSelection<Role>({
    rowKey: 'id',
  });

  // 3. 表格操作（创建、更新、删除、批量删除）
  const mutations = useRolesMutation();

  // 处理创建
  const handleCreate = () => {
    showFormDialog({
      ...getFormConfig(),
      defaultButtons: {
        okText: '创建',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.create(formValues as unknown as CreateRoleDto);
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

  // 处理编辑
  const handleEdit = (record: Role) => {
    showFormDialog({
      ...getFormConfig(record),
      initialValues: record as unknown as Record<string, unknown>,
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.update(record.id, formValues as UpdateRoleDto);
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

  // 处理删除
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确定要删除这个角色吗？',
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
      title: `确定要删除选中的 ${selection.selectedCount} 个角色吗？`,
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
        title: '角色名称',
        dataIndex: 'name',
        width: 150,
      },
      {
        key: 'code',
        title: '角色编码',
        dataIndex: 'code',
        width: 150,
      },
      {
        key: 'description',
        title: '描述',
        dataIndex: 'description',
      },
      {
        key: 'isSystem',
        title: '系统角色',
        dataIndex: 'isSystem',
        width: 100,
        render: (value: boolean) => (value ? '是' : '否'),
      },
      TableActionColumn<Role>({
        actions: [
          {
            key: 'edit',
            text: '编辑',
            icon: 'EditOutlined',
            permission: 'roles:update',
            disabled: (record) => !!record.isSystem,
            onClick: (record) => handleEdit(record),
          },
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'roles:delete',
            disabled: (record) => !!record.isSystem,
            onClick: (record) => handleDelete(record.id),
            // 注意：不需要在这里配置 confirm，因为 handleDelete 内部已经使用了 mutations.delete
            // mutations.delete 方法已经内置了 Modal.confirm 确认弹窗
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
    <div>
      {/* 表格工具栏 */}
      <TableTool
        config={{
          actions: [
            {
              key: 'create',
              text: '创建角色',
              type: 'primary',
              icon: 'PlusOutlined',
              permission: 'roles:create',
              onClick: handleCreate,
            },
            {
              key: 'batchDelete',
              text: `批量删除 (${selection.selectedCount})`,
              danger: true,
              icon: 'DeleteOutlined',
              permission: 'roles:delete',
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
    </div>
  );
}
