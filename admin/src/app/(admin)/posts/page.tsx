/**
 * 文章管理页面
 */

'use client';

import React from 'react';
import { Table, Modal, Tag } from 'antd';
import {
  postsApi,
  type Post,
  type CreatePostDto,
  type UpdatePostDto,
  type QueryPostDto,
  PostStatus,
} from '@/lib/api/posts';
import { showFormDialog } from '@/components/form/FormDialog';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection } from '@/hooks';
import { usePostsMutation } from '@/hooks/api';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';

// 表单配置
const getFormConfig = (initialValues?: Post) => ({
  title: initialValues ? '编辑文章' : '创建文章',
  fields: [
    {
      name: 'title',
      label: '文章标题',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.title,
    },
    {
      name: 'slug',
      label: 'URL Slug',
      type: 'input' as const,
      defaultValue: initialValues?.slug,
    },
    {
      name: 'summary',
      label: '摘要',
      type: 'textarea' as const,
      defaultValue: initialValues?.summary,
    },
    {
      name: 'content',
      label: '内容',
      type: 'textarea' as const,
      required: true,
      componentProps: { rows: 6 },
      defaultValue: initialValues?.content,
    },
    {
      name: 'coverImage',
      label: '封面图片',
      type: 'input' as const,
      defaultValue: initialValues?.coverImage,
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '草稿', value: PostStatus.DRAFT },
        { label: '已发布', value: PostStatus.PUBLISHED },
        { label: '已归档', value: PostStatus.ARCHIVED },
      ],
      defaultValue: initialValues?.status,
    },
    {
      name: 'isTop',
      label: '是否置顶',
      type: 'switch' as const,
      defaultValue: initialValues?.isTop,
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
      placeholder: '请输入标题或内容关键词',
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '草稿', value: PostStatus.DRAFT },
        { label: '已发布', value: PostStatus.PUBLISHED },
        { label: '已归档', value: PostStatus.ARCHIVED },
      ],
    },
    {
      name: 'isTop',
      label: '是否置顶',
      type: 'select' as const,
      placeholder: '请选择',
      options: [
        { label: '全部', value: '' },
        { label: '是', value: 'true' },
        { label: '否', value: 'false' },
      ],
    },
  ],
  grid: {
    columns: 3,
    gutter: 16,
  },
};

export default function PostsPage() {
  // 表格数据管理
  const table = useTable<Post, QueryPostDto & Record<string, unknown>>({
    queryKey: ['posts'],
    queryFn: async (params) => {
      const result = await postsApi.getPosts(params);
      return result;
    },
    initialParams: {},
    initialPagination: {
      pageSize: 10,
    },
  });

  // 表格选择
  const selection = useTableSelection<Post>({
    rowKey: 'id',
  });

  // 表格操作
  const mutations = usePostsMutation({
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
        if (key === 'isTop' && typeof value === 'string') {
          params[key] = value === 'true';
        } else {
          params[key] = value;
        }
      }
    });
    table.setParams(params as QueryPostDto & Record<string, unknown>);
  };

  // 处理编辑
  const handleEdit = (record: Post) => {
    showFormDialog({
      ...getFormConfig(record),
      initialValues: record as unknown as Record<string, unknown>,
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.update(record.id, formValues as UpdatePostDto);
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
          await mutations.create(formValues as unknown as CreatePostDto);
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
      title: '确定要删除这篇文章吗？',
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
      title: `确定要删除选中的 ${selection.selectedCount} 篇文章吗？`,
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
        key: 'title',
        title: '文章标题',
        dataIndex: 'title',
        width: 250,
      },
      {
        key: 'slug',
        title: 'Slug',
        dataIndex: 'slug',
        width: 200,
      },
      {
        key: 'status',
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (value: PostStatus) => {
          const statusMap: Record<PostStatus, { text: string; color: string }> = {
            [PostStatus.DRAFT]: { text: '草稿', color: 'default' },
            [PostStatus.PUBLISHED]: { text: '已发布', color: 'success' },
            [PostStatus.ARCHIVED]: { text: '已归档', color: 'warning' },
          };
          const status = statusMap[value] || { text: value, color: 'default' };
          return <Tag color={status.color}>{status.text}</Tag>;
        },
      },
      {
        key: 'isTop',
        title: '置顶',
        dataIndex: 'isTop',
        width: 80,
        render: (value: boolean) => (value ? <Tag color="red">置顶</Tag> : '-'),
      },
      {
        key: 'viewCount',
        title: '浏览量',
        dataIndex: 'viewCount',
        width: 100,
      },
      {
        key: 'likeCount',
        title: '点赞数',
        dataIndex: 'likeCount',
        width: 100,
      },
      {
        key: 'commentCount',
        title: '评论数',
        dataIndex: 'commentCount',
        width: 100,
      },
      TableActionColumn<Post>({
        actions: [
          {
            key: 'edit',
            text: '编辑',
            icon: 'EditOutlined',
            permission: 'posts:update',
            onClick: (record) => handleEdit(record),
          },
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'posts:delete',
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
        title="搜索文章"
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
              text: '创建文章',
              type: 'primary',
              icon: 'PlusOutlined',
              permission: 'posts:create',
              onClick: handleCreate,
            },
            {
              key: 'batchDelete',
              text: `批量删除 (${selection.selectedCount})`,
              danger: true,
              icon: 'DeleteOutlined',
              permission: 'posts:delete',
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

