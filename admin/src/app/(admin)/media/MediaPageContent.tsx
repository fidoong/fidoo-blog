/**
 * 媒体管理页面内容组件
 * 用于代码分割和懒加载
 */

'use client';

import React from 'react';
import { Table, Modal, Image, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { mediaApi, type Media, type QueryMediaDto, MediaType } from '@/lib/api/media';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool, TableActionColumn } from '@/components/table';
import { useTable, useTableSelection, useDebounce } from '@/hooks';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';
import { TableSkeleton } from '@/components/skeleton';

// 搜索表单配置
const searchFormConfig = {
  fields: [
    {
      name: 'type',
      label: '媒体类型',
      type: 'select' as const,
      placeholder: '请选择类型',
      options: [
        { label: '全部', value: '' },
        { label: '图片', value: MediaType.IMAGE },
        { label: '视频', value: MediaType.VIDEO },
        { label: '音频', value: MediaType.AUDIO },
        { label: '文档', value: MediaType.DOCUMENT },
        { label: '其他', value: MediaType.OTHER },
      ],
    },
  ],
  grid: {
    columns: 1,
    gutter: 16,
  },
};

export default function MediaPageContent() {
  // 表格数据管理
  const table = useTable<Media, QueryMediaDto & Record<string, unknown>>({
    queryKey: ['media'],
    queryFn: async (params) => {
      const result = await mediaApi.getMedia(params);
      return result;
    },
    initialParams: {},
    initialPagination: {
      pageSize: 12,
    },
  });

  // 表格选择
  const selection = useTableSelection<Media>({
    rowKey: 'id',
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
        params[key] = value;
      }
    });
    table.setParams(params as QueryMediaDto & Record<string, unknown>);
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

  // 处理上传
  const handleUpload = async (file: File) => {
    try {
      await mediaApi.uploadFile(file);
      message.success('上传成功');
      table.refetch();
    } catch (error) {
      message.error('上传失败');
      console.error('上传失败:', error);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确定要删除这个媒体文件吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await mediaApi.deleteMedia(id);
          message.success('删除成功');
          table.refetch();
        } catch (error) {
          message.error('删除失败');
          console.error('删除失败:', error);
        }
      },
    });
  };

  // 表格配置
  const tableConfig: TableSchemaConfig = {
    columns: [
      {
        key: 'preview',
        title: '预览',
        dataIndex: 'url',
        width: 120,
        render: (url: string, record: Media) => {
          if (record.type === MediaType.IMAGE) {
            return (
              <Image
                src={url}
                alt={record.originalName}
                width={80}
                height={80}
                style={{ objectFit: 'cover' }}
              />
            );
          }
          return <span>{record.originalName}</span>;
        },
      },
      {
        key: 'filename',
        title: '文件名',
        dataIndex: 'filename',
        width: 200,
      },
      {
        key: 'originalName',
        title: '原始名称',
        dataIndex: 'originalName',
        width: 200,
      },
      {
        key: 'type',
        title: '类型',
        dataIndex: 'type',
        width: 100,
        render: (value: MediaType) => {
          const typeMap: Record<MediaType, string> = {
            [MediaType.IMAGE]: '图片',
            [MediaType.VIDEO]: '视频',
            [MediaType.AUDIO]: '音频',
            [MediaType.DOCUMENT]: '文档',
            [MediaType.OTHER]: '其他',
          };
          return typeMap[value] || value;
        },
      },
      {
        key: 'size',
        title: '大小',
        dataIndex: 'size',
        width: 100,
        render: (value: number) => {
          if (value < 1024) {
            return `${value} B`;
          } else if (value < 1024 * 1024) {
            return `${(value / 1024).toFixed(2)} KB`;
          } else {
            return `${(value / (1024 * 1024)).toFixed(2)} MB`;
          }
        },
      },
      {
        key: 'mimeType',
        title: 'MIME类型',
        dataIndex: 'mimeType',
        width: 150,
      },
      {
        key: 'createdAt',
        title: '上传时间',
        dataIndex: 'createdAt',
        width: 180,
      },
      TableActionColumn<Media>({
        actions: [
          {
            key: 'delete',
            text: '删除',
            icon: 'DeleteOutlined',
            danger: true,
            permission: 'media:delete',
            onClick: (record) => handleDelete(record.id),
          },
        ],
      }),
    ],
    rowKey: 'id',
    pagination: {
      pageSize: 12,
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
        title="搜索媒体"
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
              key: 'upload',
              text: '上传文件',
              type: 'primary',
              icon: 'UploadOutlined',
              permission: 'media:upload',
              render: () => (
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleUpload(file);
                    return false;
                  }}
                >
                  <Button type="primary" icon={<UploadOutlined />}>
                    上传文件
                  </Button>
                </Upload>
              ),
            },
          ],
        }}
      />

      {/* 初始加载时使用骨架屏 */}
      {table.isLoading && table.data.length === 0 ? (
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
