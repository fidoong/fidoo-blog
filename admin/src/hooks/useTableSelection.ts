/**
 * 表格选择相关 Hooks
 * 提供行选择、批量操作等功能
 */

import { useState, useCallback, useMemo } from 'react';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { Key } from 'react';

/**
 * useTableSelection 配置
 */
export interface UseTableSelectionOptions<T> {
  /**
   * 行 Key 字段名（默认：'id'）
   */
  rowKey?: string | ((record: T) => string | number);
  /**
   * 选择类型（默认：'checkbox'）
   */
  type?: 'checkbox' | 'radio';
  /**
   * 是否禁用某些行的选择
   */
  getCheckboxProps?: (record: T) => { disabled?: boolean };
  /**
   * 选择变化回调
   */
  onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
}

/**
 * useTableSelection 返回值
 */
export interface UseTableSelectionReturn<T> {
  /**
   * 选中的行 Key 列表
   */
  selectedRowKeys: (string | number)[];
  /**
   * 选中的行数据列表
   */
  selectedRows: T[];
  /**
   * 是否已选择
   */
  hasSelected: boolean;
  /**
   * 选中数量
   */
  selectedCount: number;
  /**
   * 设置选中的行
   */
  setSelectedRowKeys: (keys: (string | number)[]) => void;
  /**
   * 清空选择
   */
  clearSelection: () => void;
  /**
   * 全选
   */
  selectAll: (dataSource: T[]) => void;
  /**
   * Ant Design 表格行选择配置
   */
  rowSelection: TableRowSelection<T>;
}

/**
 * 表格选择 Hook
 * 提供行选择、批量操作等功能
 */
export function useTableSelection<T = unknown>(
  options: UseTableSelectionOptions<T> = {},
): UseTableSelectionReturn<T> {
  const {
    rowKey = 'id',
    type = 'checkbox',
    getCheckboxProps,
    onChange: onChangeCallback,
  } = options;

  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  // 获取行的 Key
  const getRowKey = useCallback(
    (record: T): string | number => {
      if (typeof rowKey === 'function') {
        return rowKey(record);
      }
      return (record as Record<string, unknown>)[rowKey] as string | number;
    },
    [rowKey],
  );

  // 处理选择变化
  const handleChange = useCallback(
    (keys: Key[], rows: T[]) => {
      const stringOrNumberKeys = keys.map((key) =>
        typeof key === 'bigint' ? String(key) : key,
      ) as (string | number)[];
      setSelectedRowKeys(stringOrNumberKeys);
      setSelectedRows(rows);
      onChangeCallback?.(stringOrNumberKeys, rows);
    },
    [onChangeCallback],
  );

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, []);

  // 全选
  const selectAll = useCallback(
    (dataSource: T[]) => {
      const allKeys = dataSource.map((record) => getRowKey(record));
      setSelectedRowKeys(allKeys);
      setSelectedRows(dataSource);
      onChangeCallback?.(allKeys, dataSource);
    },
    [getRowKey, onChangeCallback],
  );

  // Ant Design 行选择配置
  const rowSelection: TableRowSelection<T> = useMemo(
    () => ({
      type,
      selectedRowKeys,
      onChange: handleChange,
      getCheckboxProps,
      onSelectAll: (selected, _currentSelectedRows, changeRows) => {
        if (selected) {
          const newKeys = [...selectedRowKeys, ...changeRows.map((record) => getRowKey(record))];
          const newRows = [...selectedRows, ...changeRows];
          handleChange(newKeys, newRows);
        } else {
          const changeKeys = changeRows.map((record) => getRowKey(record));
          const newKeys = selectedRowKeys.filter((key) => !changeKeys.includes(key));
          const newRows = selectedRows.filter((row) => !changeKeys.includes(getRowKey(row)));
          handleChange(newKeys, newRows);
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, selectedRowKeys, handleChange, getCheckboxProps, getRowKey],
  );

  return {
    selectedRowKeys,
    selectedRows,
    hasSelected: selectedRowKeys.length > 0,
    selectedCount: selectedRowKeys.length,
    setSelectedRowKeys,
    clearSelection,
    selectAll,
    rowSelection,
  };
}
