/**
 * 表格骨架屏组件
 * 用于在数据加载时显示占位内容
 */

'use client';

import { Table, Skeleton } from 'antd';
import type { TableProps } from 'antd';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
  tableProps?: Partial<TableProps<unknown>>;
}

/**
 * 表格骨架屏
 * @param columns 列数，默认 5
 * @param rows 行数，默认 5
 * @param showHeader 是否显示表头，默认 true
 */
export function TableSkeleton({
  columns = 5,
  rows = 5,
  showHeader = true,
  tableProps,
}: TableSkeletonProps) {
  const skeletonColumns = Array.from({ length: columns }).map((_, index) => ({
    title: showHeader ? <Skeleton.Input active style={{ width: 100 }} /> : undefined,
    dataIndex: `loading-${index}`,
    key: `loading-${index}`,
    render: () => <Skeleton.Input active style={{ width: '80%' }} />,
  }));

  const skeletonData = Array.from({ length: rows }).map((_, index) => ({
    key: `row-${index}`,
  }));

  return (
    <Table columns={skeletonColumns} dataSource={skeletonData} pagination={false} {...tableProps} />
  );
}
