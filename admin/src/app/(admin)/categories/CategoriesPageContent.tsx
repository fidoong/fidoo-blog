/**
 * 分类管理页面内容组件
 * 用于代码分割和懒加载
 */

'use client';

import React from 'react';
import { Table, Modal } from 'antd';
import {
  categoriesApi,
  type Category,
  type CreateCategoryDto,
  type UpdateCategoryDto,
  type QueryCategoryDto,
} from '@/lib/api/categories';
import { showFormDialog } from '@/components/form/FormDialog';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection, useDebounce } from '@/hooks';
import { useCategoriesMutation } from '@/hooks/api';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';
import { TableSkeleton } from '@/components/skeleton';

// 表单配置
const getFormConfig = (initialValues?: Category) => ({
  title: initialValues ? '编辑分类' : '创建分类',
  fields: [
    {
      name: 'name',
      label: '分类名称',
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
      name: 'description',
      label: '描述',
      type: 'textarea' as const,
      defaultValue: initialValues?.description,
    },
    {
      name: 'parentId',
      label: '父分类',
      type: 'select' as const,
      placeholder: '请选择父分类（留空为顶级分类）',
      options: [],
      defaultValue: initialValues?.parentId,
    },
    {
      name: 'level',
      label: '层级',
      type: 'number' as const,
      defaultValue: initialValues?.level || 0,
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
      name: 'icon',
      label: '图标',
      type: 'input' as const,
      defaultValue: initialValues?.icon,
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
      placeholder: '请输入分类名称',
    },
    {
      name: 'level',
      label: '层级',
      type: 'select' as const,
      placeholder: '请选择层级',
      options: [
        { label: '全部', value: '' },
        { label: '大类', value: '0' },
        { label: '分类', value: '1' },
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
    columns: 3,
    gutter: 16,
  },
};

export default function CategoriesPageContent() {
  // 表格数据管理
  const table = useTable<Category, QueryCategoryDto & Record<string, unknown>>({
    queryKey: ['categories'],
    queryFn: async (params) => {
      const result = await categoriesApi.getCategories(params);
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
  const selection = useTableSelection<Category>({
    rowKey: 'id',
  });

  // 表格操作
  const mutations = useCategoriesMutation({
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

  // 搜索值状态
  const [searchValues, setSearchValues] = React.useState<Record<string, unknown>>({});

  // 防抖搜索值
  const debouncedSearchValues = useDebounce(searchValues, 500);

  // 当防抖后的搜索值变化时，更新查询参数
  React.useEffect(() => {
    const params: Record<string, unknown> = {};
    Object.keys(debouncedSearchValues).forEach((key) => {
      const value = debouncedSearchValues[key];
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'isActive' && typeof value === 'string') {
          params[key] = value === 'true';
        } else if (key === 'level' && typeof value === 'string') {
          params[key] = parseInt(value, 10);
        } else {
          params[key] = value;
        }
      }
    });
    table.setParams(params as QueryCategoryDto & Record<string, unknown>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValues]);

  // 处理搜索
  const handleSearch = (values: Record<string, unknown>) => {
    setSearchValues(values);
  };

  // 处理搜索值变化
  const handleSearchChange = (values: Record<string, unknown>) => {
    setSearchValues(values);
  };

  // 处理编辑
  const handleEdit = (record: Category) => {
    showFormDialog({
      ...getFormConfig(record),
      initialValues: record as unknown as Record<string, unknown>,
      defaultButtons: {
        okText: '保存',
        cancelText: '取消',
        onSubmit: async (formValues: Record<string, unknown>) => {
          await mutations.update(record.id, formValues as UpdateCategoryDto);
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
          await mutations.create(formValues as unknown as CreateCategoryDto);
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
      title: '确定要删除这个分类吗？',
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
      title: `确定要删除选中的 ${selection.selectedCount} 个分类吗？`,
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
        title: '分类名称',
        dataIndex: 'name',
        width: 150,
      },
      {
        key: 'slug',
        title: 'Slug',
        dataIndex: 'slug',
        width: 150,
      },
      {
        key: 'level',
        title: '层级',
        dataIndex: 'level',
        width: 80,
        render: (value: number) => (value === 0 ? '大类' : '分类'),
      },
      {
        key: 'parentId',
        title: '父分类',
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
      TableActionColumn<Category>({
        actions: [
          {
            key: 'edit',
            text: '编辑',
            icon: 'EditOutlined',
            permission: 'categories:update',
            onClick: (record) => handleEdit(record),
          },
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'categories:delete',
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

  // 初始加载时显示骨架屏
  const isInitialLoading = table.isLoading && table.data.length === 0;

  return (
    <>
      {/* 搜索表单 */}
      <TableSearchForm
        {...searchFormConfig}
        title="搜索分类"
        value={searchValues}
        onChange={handleSearchChange}
        onSubmit={handleSearch}
        onReset={() => {
          setSearchValues({});
          table.resetParams();
        }}
      />

      {/* 表格工具栏 */}
      <TableTool
        config={{
          actions: [
            {
              key: 'create',
              text: '创建分类',
              type: 'primary',
              icon: 'PlusOutlined',
              permission: 'categories:create',
              onClick: handleCreate,
            },
            {
              key: 'batchDelete',
              text: `批量删除 (${selection.selectedCount})`,
              danger: true,
              icon: 'DeleteOutlined',
              permission: 'categories:delete',
              disabled: !selection.hasSelected,
              onClick: handleBatchDelete,
            },
          ],
        }}
      />

      {/* 初始加载时使用骨架屏 */}
      {isInitialLoading ? (
        <TableSkeleton columns={6} rows={5} />
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
