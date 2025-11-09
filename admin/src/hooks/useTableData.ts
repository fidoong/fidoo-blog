/**
 * 表格数据相关 Hooks
 * 提供数据格式化、导出等功能
 */

import { useMemo } from 'react';

/**
 * 导出格式
 */
export type ExportFormat = 'csv' | 'excel' | 'json';

/**
 * useTableData 配置
 */
export interface UseTableDataOptions<T> {
  /**
   * 数据源
   */
  dataSource: T[];
  /**
   * 是否启用导出功能
   */
  enableExport?: boolean;
  /**
   * 导出文件名
   */
  exportFileName?: string;
}

/**
 * useTableData 返回值
 */
export interface UseTableDataReturn<T> {
  /**
   * 格式化后的数据
   */
  formattedData: T[];
  /**
   * 导出为 CSV
   */
  exportToCSV: (columns: Array<{ title: string; dataIndex: string }>) => void;
  /**
   * 导出为 JSON
   */
  exportToJSON: () => void;
  /**
   * 导出数据
   */
  exportData: (format: ExportFormat, columns?: Array<{ title: string; dataIndex: string }>) => void;
}

/**
 * 表格数据 Hook
 * 提供数据格式化、导出等功能
 */
export function useTableData<T = unknown>(options: UseTableDataOptions<T>): UseTableDataReturn<T> {
  const { dataSource, enableExport = false, exportFileName = 'table-data' } = options;

  // 格式化数据
  const formattedData = useMemo(() => {
    return dataSource;
  }, [dataSource]);

  // 导出为 CSV
  const exportToCSV = (columns: Array<{ title: string; dataIndex: string }>) => {
    if (!enableExport) {
      return;
    }

    // 构建 CSV 头部
    const headers = columns.map((col) => col.title).join(',');

    // 构建 CSV 数据行
    const rows = dataSource.map((item) => {
      return columns
        .map((col) => {
          const value = (item as Record<string, unknown>)[col.dataIndex];
          // 处理包含逗号的值
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value ?? '';
        })
        .join(',');
    });

    // 组合 CSV 内容
    const csvContent = [headers, ...rows].join('\n');

    // 创建 Blob 并下载
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 导出为 JSON
  const exportToJSON = () => {
    if (!enableExport) {
      return;
    }

    const jsonContent = JSON.stringify(dataSource, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFileName}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 导出数据
  const exportData = (
    format: ExportFormat,
    columns?: Array<{ title: string; dataIndex: string }>
  ) => {
    if (!enableExport) {
      return;
    }

    switch (format) {
      case 'csv':
        if (!columns) {
          console.warn('导出 CSV 需要提供 columns');
          return;
        }
        exportToCSV(columns);
        break;
      case 'json':
        exportToJSON();
        break;
      case 'excel':
        // Excel 导出需要额外的库，这里先提示
        console.warn('Excel 导出功能需要安装额外的库（如 xlsx）');
        break;
      default:
        console.warn(`不支持的导出格式: ${format}`);
    }
  };

  return {
    formattedData,
    exportToCSV,
    exportToJSON,
    exportData,
  };
}
