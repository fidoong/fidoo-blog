/**
 * 标签管理页面
 */

'use client';

import React from 'react';
import { Table, Modal, Tag } from 'antd';
import {
  tagsApi,
  type Tag as TagType,
  type CreateTagDto,
  type UpdateTagDto,
  type QueryTagDto,
} from '@/lib/api/tags';
import { showFormDialog } from '@/components/form/FormDialog';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection } from '@/hooks';
import { useTagsMutation } from '@/hooks/api';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';

// 表单配置
const getFormConfig = (initialValues?: TagType) => ({
  title: initialValues ? '编辑标签' : '创建标签',
  fields: [
    {
      name: 'name',
      label: '标签名称',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.name,
    },
    {
      name: 'slug',
      label: 'URL Slug',
      type: 'input' as const,
      defaultValue: initialValues?.slug,
    },
    {
      name: 'color',
      label: '颜色',
      type: 'input' as const,
      placeholder: '如：#1890ff',
      defaultValue: initialValues?.color,
    },
    {
      name: 'categoryId',
      label: '所属分类',
      type: 'select' as const,
      placeholder: '请选择分类（可选）',
      // TODO: 需要从 API 获取分类列表作为选项
      options: [],
      defaultValue: initialValues?.categoryId,
    },
  ],
  layout: 'vertical' as const,
});

// 搜索表单配置
const searchFormConfig = {
  fields: [
    {
      name: 'keyword',
      label: '关键词',
      type: 'input' as const,
      placeholder: '请输入标签名称',
    },
    {
      name: 'categoryId',
      label: '所属分类',
      type: 'select' as const,
      placeholder: '请选择分类',
      // TODO: 需要从 API 获取分类列表作为选项
      options: [],
    },
  ],
  grid: {
    columns: 2,
    gutter: 16,
  },
};

export default function TagsPage() {
  // 表格数据管理
  const table = useTable<TagType, QueryTagDto & Record<string, unknown>>({
    queryKey: ['tags'],
    queryFn: async (params) => {
      const result = await tagsApi.getTags(params);
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
  const selection = useTableSelection<TagType>({
    rowKey: 'id',
  });

  // 表格操作
  const mutations = useTagsMutation({
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
    table.setParams(params as QueryTagDto & Record<string, unknown>);
  };

  // 处理编辑
  const handleEdit = (record: TagType) => {
    showFormDialog({
      ...getFormConfig(record),
      initialValues: record as unknown as Record<string, unknown>,
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.update(record.id, formValues as UpdateTagDto);
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
          await mutations.create(formValues as unknown as CreateTagDto);
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
      title: '确定要删除这个标签吗？',
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
      title: `确定要删除选中的 ${selection.selectedCount} 个标签吗？`,
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
        title: '标签名称',
        dataIndex: 'name',
        width: 150,
        render: (value: string, record: TagType) => {
          if (record.color) {
            return <Tag color={record.color}>{value}</Tag>;
          }
          return value;
        },
      },
      {
        key: 'slug',
        title: 'Slug',
        dataIndex: 'slug',
        width: 150,
      },
      {
        key: 'color',
        title: '颜色',
        dataIndex: 'color',
        width: 100,
        render: (value: string) => {
          if (value) {
            return (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 20,
                    height: 20,
                    backgroundColor: value,
                    borderRadius: 4,
                    border: '1px solid #d9d9d9',
                  }}
                />
                {value}
              </span>
            );
          }
          return '-';
        },
      },
      {
        key: 'categoryId',
        title: '所属分类',
        dataIndex: 'categoryId',
        width: 120,
        render: (value: string) => value || '-',
      },
      TableActionColumn<TagType>({
        actions: [
          {
            key: 'edit',
            text: '编辑',
            icon: 'EditOutlined',
            permission: 'tags:update',
            onClick: (record) => handleEdit(record),
          },
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'tags:delete',
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
        title="搜索标签"
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
              text: '创建标签',
              type: 'primary',
              icon: 'PlusOutlined',
              permission: 'tags:create',
              onClick: handleCreate,
            },
            {
              key: 'batchDelete',
              text: `批量删除 (${selection.selectedCount})`,
              danger: true,
              icon: 'DeleteOutlined',
              permission: 'tags:delete',
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

