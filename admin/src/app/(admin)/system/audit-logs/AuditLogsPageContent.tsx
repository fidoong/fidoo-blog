/**
 * 审计日志页面内容组件
 * 用于代码分割和懒加载
 */

'use client';

import React from 'react';
import { Table, Tag, Space, Modal, message, DatePicker } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  auditLogsApi,
  type AuditLog,
  type QueryAuditLogsDto,
  AuditAction,
  AuditStatus,
  AuditSeverity,
} from '@/lib/api/audit-logs';
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { TableTool } from '@/components/table';
import { useTable, useDebounce } from '@/hooks';
import { buildTableColumns } from '@/lib/schema/builder';
import type { TableSchemaConfig } from '@/lib/schema/types';
import { TableSkeleton } from '@/components/skeleton';

const { RangePicker } = DatePicker;

// 操作类型选项
const actionOptions = Object.values(AuditAction).map((action) => ({
  label: action,
  value: action,
}));

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '成功', value: AuditStatus.SUCCESS },
  { label: '错误', value: AuditStatus.ERROR },
  { label: '警告', value: AuditStatus.WARNING },
];

// 严重程度选项
const severityOptions = [
  { label: '全部', value: '' },
  { label: '低', value: AuditSeverity.LOW },
  { label: '中', value: AuditSeverity.MEDIUM },
  { label: '高', value: AuditSeverity.HIGH },
  { label: '严重', value: AuditSeverity.CRITICAL },
];

// 搜索表单配置
const searchFormConfig = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      type: 'input' as const,
      placeholder: '请输入用户名',
    },
    {
      name: 'action',
      label: '操作类型',
      type: 'select' as const,
      placeholder: '请选择操作类型',
      options: [{ label: '全部', value: '' }, ...actionOptions],
    },
    {
      name: 'resource',
      label: '资源类型',
      type: 'input' as const,
      placeholder: '请输入资源类型',
    },
    {
      name: 'ip',
      label: 'IP 地址',
      type: 'input' as const,
      placeholder: '请输入 IP 地址',
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: statusOptions,
    },
    {
      name: 'severity',
      label: '严重程度',
      type: 'select' as const,
      placeholder: '请选择严重程度',
      options: severityOptions,
    },
    {
      name: 'isAnomaly',
      label: '是否异常',
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
    columns: 4,
    gutter: 16,
  },
};

export default function AuditLogsPageContent() {
  // 表格数据管理
  const table = useTable<AuditLog, QueryAuditLogsDto & Record<string, unknown>>({
    queryKey: ['audit-logs'],
    queryFn: async (params) => {
      const result = await auditLogsApi.getAuditLogs(params);
      // 转换为分页格式
      return {
        items: result.logs,
        total: result.total,
      };
    },
    initialParams: {},
    initialPagination: {
      pageSize: 20,
    },
  });

  // 搜索值状态
  const [searchValues, setSearchValues] = React.useState<Record<string, unknown>>({});
  const [dateRange, setDateRange] = React.useState<[Dayjs | null, Dayjs | null] | null>(null);

  // 防抖搜索值
  const debouncedSearchValues = useDebounce(searchValues, 500);

  // 当搜索值变化时，更新查询参数
  React.useEffect(() => {
    const params: Record<string, unknown> = {};
    Object.keys(debouncedSearchValues).forEach((key) => {
      const value = debouncedSearchValues[key];
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'isAnomaly' && typeof value === 'string') {
          params[key] = value === 'true';
        } else {
          params[key] = value;
        }
      }
    });

    // 添加时间范围
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startTime = dateRange[0].toISOString();
      params.endTime = dateRange[1].toISOString();
    }

    table.setParams(params as QueryAuditLogsDto & Record<string, unknown>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValues, dateRange]);

  // 处理搜索
  const handleSearch = (values: Record<string, unknown>) => {
    setSearchValues(values);
  };

  // 处理搜索值变化
  const handleSearchChange = (values: Record<string, unknown>) => {
    setSearchValues(values);
  };

  // 处理清理过期日志
  const handleCleanLogs = () => {
    Modal.confirm({
      title: '确认清理过期日志',
      icon: <ExclamationCircleOutlined />,
      content: '确定要清理90天前的审计日志吗？此操作不可恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await auditLogsApi.cleanOldLogs(90);
          message.success(result.message);
          table.refresh();
        } catch (error) {
          message.error('清理失败');
          console.error('清理失败:', error);
        }
      },
    });
  };

  // 表格配置
  const tableConfig: TableSchemaConfig = {
    columns: [
      {
        key: 'timestamp',
        title: '时间',
        dataIndex: 'timestamp',
        width: 180,
        render: (value: string) => {
          return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        key: 'username',
        title: '用户',
        dataIndex: 'username',
        width: 120,
        render: (value: string) => value || '-',
      },
      {
        key: 'action',
        title: '操作',
        dataIndex: 'action',
        width: 150,
        render: (value: AuditAction) => {
          return <Tag color="blue">{value}</Tag>;
        },
      },
      {
        key: 'resource',
        title: '资源',
        dataIndex: 'resource',
        width: 120,
        render: (value: string) => value || '-',
      },
      {
        key: 'ip',
        title: 'IP 地址',
        dataIndex: 'ip',
        width: 140,
        render: (value: string) => value || '-',
      },
      {
        key: 'status',
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (value: AuditStatus) => {
          const statusMap: Record<AuditStatus, { text: string; color: string }> = {
            [AuditStatus.SUCCESS]: { text: '成功', color: 'success' },
            [AuditStatus.ERROR]: { text: '错误', color: 'error' },
            [AuditStatus.WARNING]: { text: '警告', color: 'warning' },
          };
          const status = statusMap[value] || { text: value, color: 'default' };
          return <Tag color={status.color}>{status.text}</Tag>;
        },
      },
      {
        key: 'severity',
        title: '严重程度',
        dataIndex: 'severity',
        width: 100,
        render: (value: AuditSeverity) => {
          const severityMap: Record<AuditSeverity, { text: string; color: string }> = {
            [AuditSeverity.LOW]: { text: '低', color: 'default' },
            [AuditSeverity.MEDIUM]: { text: '中', color: 'processing' },
            [AuditSeverity.HIGH]: { text: '高', color: 'warning' },
            [AuditSeverity.CRITICAL]: { text: '严重', color: 'error' },
          };
          const severity = severityMap[value] || { text: value, color: 'default' };
          return <Tag color={severity.color}>{severity.text}</Tag>;
        },
      },
      {
        key: 'isAnomaly',
        title: '异常',
        dataIndex: 'isAnomaly',
        width: 80,
        render: (value: boolean) => {
          return value ? <Tag color="error">异常</Tag> : <Tag>正常</Tag>;
        },
      },
      {
        key: 'anomalyReason',
        title: '异常原因',
        dataIndex: 'anomalyReason',
        width: 200,
        render: (value: string) => value || '-',
      },
    ],
    rowKey: 'id',
    pagination: {
      pageSize: 20,
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
        title="搜索审计日志"
        value={searchValues}
        onChange={handleSearchChange}
        onSubmit={handleSearch}
        onReset={() => {
          setSearchValues({});
          setDateRange(null);
          table.resetParams();
        }}
      />

      {/* 时间范围选择器 */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>时间范围：</span>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Space>
      </div>

      {/* 表格工具栏 */}
      <TableTool
        config={{
          actions: [
            {
              key: 'refresh',
              text: '刷新',
              icon: 'ReloadOutlined',
              onClick: () => {
                table.refresh();
              },
            },
            {
              key: 'clean',
              text: '清理过期日志',
              danger: true,
              icon: 'DeleteOutlined',
              permission: 'audit-logs:clean',
              onClick: handleCleanLogs,
            },
          ],
        }}
      />

      {/* 初始加载时使用骨架屏 */}
      {isInitialLoading ? (
        <TableSkeleton columns={9} rows={10} />
      ) : (
        <Table
          columns={columns}
          dataSource={table.data}
          loading={table.isLoading}
          rowKey="id"
          pagination={table.pagination}
          scroll={{ x: 1400 }}
        />
      )}
    </>
  );
}
