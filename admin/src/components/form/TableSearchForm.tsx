/**
 * 表格搜索表单组件
 * 基于 SchemaForm 的表格搜索专用组件
 * 重新设计：简化逻辑，确保每次查询都能正确触发
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button } from 'antd';
import { SchemaForm, type SchemaFormProps } from './SchemaForm';

export interface TableSearchFormProps extends Omit<SchemaFormProps, 'compact' | 'layout' | 'grid'> {
  /**
   * 是否显示卡片容器
   */
  card?: boolean;
  /**
   * 卡片标题
   */
  title?: string;
  /**
   * 是否默认展开
   */
  defaultExpand?: boolean;
  /**
   * 是否可折叠
   */
  collapsible?: boolean;
  /**
   * 搜索值（受控）
   */
  value?: Record<string, unknown>;
  /**
   * 搜索值变化回调
   */
  onChange?: (values: Record<string, unknown>) => void;
  /**
   * Grid 布局配置
   */
  grid?: {
    columns?: number;
    gutter?: number;
  };
}

/**
 * 表格搜索表单组件
 */
export function TableSearchForm({
  card = true,
  title = '搜索',
  defaultExpand = true,
  collapsible = false,
  value,
  onChange,
  onSubmit,
  onReset,
  grid = { columns: 4, gutter: 16 },
  ...rest
}: TableSearchFormProps) {
  const [expanded, setExpanded] = useState(defaultExpand);
  const [searchValues, setSearchValues] = useState<Record<string, unknown>>(value || {});

  // 处理搜索
  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setSearchValues(values);
      if (onChange) {
        onChange(values);
      }
      if (onSubmit) {
        await onSubmit(values);
      }
    },
    [onChange, onSubmit]
  );

  // 处理重置
  const handleReset = useCallback(() => {
    const emptyValues: Record<string, unknown> = {};
    setSearchValues(emptyValues);
    if (onChange) {
      onChange(emptyValues);
    }
    if (onReset) {
      onReset();
    } else if (onSubmit) {
      // 重置后自动提交空值，清空搜索条件
      onSubmit(emptyValues);
    }
  }, [onChange, onReset, onSubmit]);

  // 当外部 value 变化时，同步更新内部状态
  useEffect(() => {
    if (value !== undefined) {
      setSearchValues(value);
    }
  }, [value]);

  const formContent = (
    <SchemaForm
      {...rest}
      compact
      layout="inline"
      grid={grid}
      initialValues={searchValues}
      onSubmit={handleSubmit}
      onReset={handleReset}
    />
  );

  if (!card) {
    return <div style={{ marginBottom: 16 }}>{formContent}</div>;
  }

  return (
    <Card
      title={title}
      size="small"
      style={{ marginBottom: 16 }}
      {...(collapsible && {
        extra: (
          <Button type="link" onClick={() => setExpanded(!expanded)}>
            {expanded ? '收起' : '展开'}
          </Button>
        ),
      })}
    >
      {expanded && formContent}
    </Card>
  );
}
