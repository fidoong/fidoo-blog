/**
 * 字典管理页面
 */

'use client';

import React from 'react';
import { Table, Modal } from 'antd';
import {
  dictionariesApi,
  type Dictionary,
  type CreateDictionaryDto,
  type UpdateDictionaryDto,
  type QueryDictionaryDto,
  DictionaryType,
} from '@/lib/api/dictionaries';
import { showFormDialog } from '@/components/form/FormDialog';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection } from '@/hooks';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';

// 表单配置
const getFormConfig = (initialValues?: Dictionary) => ({
  title: initialValues ? '编辑字典' : '创建字典',
  fields: [
    {
      name: 'code',
      label: '字典编码',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.code,
      disabled: !!initialValues,
    },
    {
      name: 'label',
      label: '字典标签',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.label,
    },
    {
      name: 'value',
      label: '字典值',
      type: 'input' as const,
      required: true,
      defaultValue: initialValues?.value,
    },
    {
      name: 'type',
      label: '字典类型',
      type: 'select' as const,
      options: [
        { label: '系统', value: DictionaryType.SYSTEM },
        { label: '业务', value: DictionaryType.BUSINESS },
        { label: '自定义', value: DictionaryType.CUSTOM },
      ],
      defaultValue: initialValues?.type,
    },
    {
      name: 'parentId',
      label: '父字典',
      type: 'select' as const,
      placeholder: '请选择父字典（留空为顶级）',
      // TODO: 需要从 API 获取字典列表作为选项
      options: [],
      defaultValue: initialValues?.parentId,
    },
    {
      name: 'sortOrder',
      label: '排序',
      type: 'number' as const,
      defaultValue: initialValues?.sortOrder || 0,
    },
    {
      name: 'isActive',
      label: '是否启用',
      type: 'switch' as const,
      defaultValue: initialValues?.isActive ?? true,
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
      name: 'keyword',
      label: '关键词',
      type: 'input' as const,
      placeholder: '请输入编码、标签或值',
    },
    {
      name: 'code',
      label: '字典编码',
      type: 'input' as const,
      placeholder: '请输入字典编码',
    },
    {
      name: 'type',
      label: '字典类型',
      type: 'select' as const,
      placeholder: '请选择类型',
      options: [
        { label: '全部', value: '' },
        { label: '系统', value: DictionaryType.SYSTEM },
        { label: '业务', value: DictionaryType.BUSINESS },
        { label: '自定义', value: DictionaryType.CUSTOM },
      ],
    },
    {
      name: 'isActive',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '全部', value: '' },
        { label: '启用', value: 'true' },
        { label: '禁用', value: 'false' },
      ],
    },
  ],
  grid: {
    columns: 4,
    gutter: 16,
  },
};

export default function DictionariesPage() {
  // 表格数据管理
  const table = useTable<Dictionary, QueryDictionaryDto & Record<string, unknown>>({
    queryKey: ['dictionaries'],
    queryFn: async (params) => {
      const result = await dictionariesApi.getDictionaries(params);
      return result;
    },
    initialParams: {},
    initialPagination: {
      pageSize: 10,
    },
  });

  // 表格选择
  const selection = useTableSelection<Dictionary>({
    rowKey: 'id',
  });

  // 处理搜索
  const handleSearch = (values: Record<string, unknown>) => {
    const params: Record<string, unknown> = {};
    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'isActive' && typeof value === 'string') {
          params[key] = value === 'true';
        } else {
          params[key] = value;
        }
      }
    });
    table.setParams(params as QueryDictionaryDto & Record<string, unknown>);
  };

  // 处理编辑
  const handleEdit = (record: Dictionary) => {
    showFormDialog({
      ...getFormConfig(record),
      initialValues: record as unknown as Record<string, unknown>,
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await dictionariesApi.updateDictionary(record.id, formValues as UpdateDictionaryDto);
          table.refetch();
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
          await dictionariesApi.createDictionary(formValues as unknown as CreateDictionaryDto);
          table.resetPagination();
          table.refetch();
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
      title: '确定要删除这个字典吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dictionariesApi.deleteDictionary(id);
          table.refetch();
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
      title: `确定要删除选中的 ${selection.selectedCount} 个字典吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dictionariesApi.batchDeleteDictionaries(selection.selectedRowKeys as string[]);
          selection.clearSelection();
          table.refetch();
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
        key: 'code',
        title: '字典编码',
        dataIndex: 'code',
        width: 150,
      },
      {
        key: 'label',
        title: '字典标签',
        dataIndex: 'label',
        width: 150,
      },
      {
        key: 'value',
        title: '字典值',
        dataIndex: 'value',
        width: 150,
      },
      {
        key: 'type',
        title: '类型',
        dataIndex: 'type',
        width: 100,
        render: (value: DictionaryType) => {
          const typeMap: Record<DictionaryType, string> = {
            [DictionaryType.SYSTEM]: '系统',
            [DictionaryType.BUSINESS]: '业务',
            [DictionaryType.CUSTOM]: '自定义',
          };
          return typeMap[value] || value;
        },
      },
      {
        key: 'parentId',
        title: '父字典',
        dataIndex: 'parentId',
        width: 120,
        render: (value: string) => value || '-',
      },
      {
        key: 'sortOrder',
        title: '排序',
        dataIndex: 'sortOrder',
        width: 80,
      },
      {
        key: 'isActive',
        title: '状态',
        dataIndex: 'isActive',
        width: 100,
        render: (value: boolean) => (value ? '启用' : '禁用'),
      },
      TableActionColumn<Dictionary>({
        actions: [
          {
            key: 'edit',
            text: '编辑',
            icon: 'EditOutlined',
            permission: 'dictionaries:update',
            onClick: (record) => handleEdit(record),
          },
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'dictionaries:delete',
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
        title="搜索字典"
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
              text: '创建字典',
              type: 'primary',
              icon: 'PlusOutlined',
              permission: 'dictionaries:create',
              onClick: handleCreate,
            },
            {
              key: 'batchDelete',
              text: `批量删除 (${selection.selectedCount})`,
              danger: true,
              icon: 'DeleteOutlined',
              permission: 'dictionaries:delete',
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
