/**
 * 评论管理页面
 */

'use client';

import React from 'react';
import { Table, Modal, Tag, Button, Space } from 'antd';
import {
  commentsApi,
  type Comment,
  type CreateCommentDto,
  type UpdateCommentDto,
  type QueryCommentDto,
  CommentStatus,
} from '@/lib/api/comments';
import { showFormDialog } from '@/components/form/FormDialog';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection } from '@/hooks';
import { useCommentsMutation } from '@/hooks/api';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';

// 表单配置
const getFormConfig = (initialValues?: Comment) => ({
  title: initialValues ? '编辑评论' : '创建评论',
  fields: [
    {
      name: 'content',
      label: '评论内容',
      type: 'textarea' as const,
      required: true,
      componentProps: { rows: 4 },
      defaultValue: initialValues?.content,
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: [
        { label: '待审核', value: CommentStatus.PENDING },
        { label: '已通过', value: CommentStatus.APPROVED },
        { label: '已拒绝', value: CommentStatus.REJECTED },
      ],
      defaultValue: initialValues?.status,
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
      placeholder: '请输入评论内容关键词',
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '待审核', value: CommentStatus.PENDING },
        { label: '已通过', value: CommentStatus.APPROVED },
        { label: '已拒绝', value: CommentStatus.REJECTED },
      ],
    },
    {
      name: 'postId',
      label: '文章ID',
      type: 'input' as const,
      placeholder: '请输入文章ID',
    },
  ],
  grid: {
    columns: 3,
    gutter: 16,
  },
};

export default function CommentsPage() {
  // 表格数据管理
  const table = useTable<Comment, QueryCommentDto & Record<string, unknown>>({
    queryKey: ['comments'],
    queryFn: async (params) => {
      const result = await commentsApi.getComments(params);
      return result;
    },
    initialParams: {},
    initialPagination: {
      pageSize: 10,
    },
  });

  // 表格选择
  const selection = useTableSelection<Comment>({
    rowKey: 'id',
  });

  // 表格操作
  const mutations = useCommentsMutation({
    refreshMode: 'refetch',
    onSuccess: {
      delete: () => {
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
    const params: Record<string, unknown> = {};
    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    table.setParams(params as QueryCommentDto & Record<string, unknown>);
  };

  // 处理编辑
  const handleEdit = (record: Comment) => {
    showFormDialog({
      ...getFormConfig(record),
      initialValues: record as unknown as Record<string, unknown>,
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.update(record.id, formValues as UpdateCommentDto);
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
          await mutations.create(formValues as unknown as CreateCommentDto);
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
      title: '确定要删除这条评论吗？',
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

  // 处理审核通过
  const handleApprove = async (id: string) => {
    Modal.confirm({
      title: '确定要通过这条评论吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await mutations.approve(id);
        } catch (error) {
          console.error('操作失败:', error);
        }
      },
    });
  };

  // 处理拒绝
  const handleReject = async (id: string) => {
    Modal.confirm({
      title: '确定要拒绝这条评论吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await mutations.reject(id);
        } catch (error) {
          console.error('操作失败:', error);
        }
      },
    });
  };

  // 表格配置
  const tableConfig: TableSchemaConfig = {
    columns: [
      {
        key: 'content',
        title: '评论内容',
        dataIndex: 'content',
        width: 300,
        ellipsis: true,
      },
      {
        key: 'status',
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (value: CommentStatus) => {
          const statusMap: Record<CommentStatus, { text: string; color: string }> = {
            [CommentStatus.PENDING]: { text: '待审核', color: 'warning' },
            [CommentStatus.APPROVED]: { text: '已通过', color: 'success' },
            [CommentStatus.REJECTED]: { text: '已拒绝', color: 'error' },
          };
          const status = statusMap[value] || { text: value, color: 'default' };
          return <Tag color={status.color}>{status.text}</Tag>;
        },
      },
      {
        key: 'postId',
        title: '文章ID',
        dataIndex: 'postId',
        width: 120,
      },
      {
        key: 'userId',
        title: '用户ID',
        dataIndex: 'userId',
        width: 120,
      },
      {
        key: 'likeCount',
        title: '点赞数',
        dataIndex: 'likeCount',
        width: 100,
      },
      {
        key: 'createdAt',
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 180,
      },
      TableActionColumn<Comment>({
        actions: [
          {
            key: 'edit',
            text: '编辑',
            icon: 'EditOutlined',
            permission: 'comments:update',
            onClick: (record) => handleEdit(record),
          },
          {
            key: 'approve',
            text: '通过',
            icon: 'CheckOutlined',
            permission: 'comments:approve',
            onClick: (record) => handleApprove(record.id),
            hidden: (record) => record.status === CommentStatus.APPROVED,
          },
          {
            key: 'reject',
            text: '拒绝',
            icon: 'CloseOutlined',
            danger: true,
            permission: 'comments:reject',
            onClick: (record) => handleReject(record.id),
            hidden: (record) => record.status === CommentStatus.REJECTED,
          },
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'comments:delete',
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
        title="搜索评论"
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
              text: '创建评论',
              type: 'primary',
              icon: 'PlusOutlined',
              permission: 'comments:create',
              onClick: handleCreate,
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

