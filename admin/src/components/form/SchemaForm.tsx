/**
 * Schema 表单组件
 * 基于 Formily 的配置化表单组件，用于表格搜索等场景
 * 重新设计：简化逻辑，确保表单值变化能正确触发查询
 */

'use client';

import React, { useMemo } from 'react';
import { createForm } from '@formily/core';
import { FormProvider, createSchemaField } from '@formily/react';
import { toJS } from '@formily/reactive';
import {
  FormItem,
  Input,
  NumberPicker,
  Select,
  DatePicker,
  Switch,
  FormButtonGroup,
  Submit,
  FormLayout,
} from '@formily/antd-v5';
import { Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { buildFormSchema } from '@/lib/schema/builder';
import type { FormSchemaConfig } from '@/lib/schema/types';

// 创建 SchemaField
const SchemaField = createSchemaField({
  components: {
    FormItem,
    Input,
    NumberPicker,
    Select,
    DatePicker,
    Switch,
  },
});

export interface SchemaFormProps extends Omit<FormSchemaConfig, 'grid'> {
  /**
   * 初始值
   */
  initialValues?: Record<string, unknown>;
  /**
   * 表单值变化回调
   */
  onValuesChange?: (values: Record<string, unknown>) => void;
  /**
   * 提交回调
   */
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
  /**
   * 重置回调
   */
  onReset?: () => void;
  /**
   * 提交按钮文本
   */
  submitText?: string;
  /**
   * 重置按钮文本
   */
  resetText?: string;
  /**
   * 是否显示提交按钮
   */
  showSubmit?: boolean;
  /**
   * 是否显示重置按钮
   */
  showReset?: boolean;
  /**
   * 是否紧凑模式（用于表格搜索）
   */
  compact?: boolean;
  /**
   * 自定义操作按钮
   */
  actions?: React.ReactNode;
  /**
   * 表单实例（外部控制）
   */
  form?: ReturnType<typeof createForm>;
  /**
   * Grid 布局配置（使用 CSS Grid，不嵌套字段值）
   */
  grid?: {
    columns?: number;
    gutter?: number;
  };
}

/**
 * Schema 表单组件
 */
export function SchemaForm({
  fields,
  layout = 'inline',
  labelCol,
  wrapperCol,
  initialValues = {},
  onValuesChange,
  onSubmit,
  onReset,
  submitText = '查询',
  resetText = '重置',
  showSubmit = true,
  showReset = true,
  compact = false,
  actions,
  form: externalForm,
  grid,
  ...rest
}: SchemaFormProps) {
  // 创建表单实例 - 每次 initialValues 变化时重新创建，确保表单值正确
  const form = useMemo(() => {
    if (externalForm) {
      return externalForm;
    }

    return createForm({
      initialValues,
      validateFirst: false,
    });
  }, [externalForm, initialValues]);

  // 构建 Schema - 不使用 FormGrid，直接使用字段
  const schema = useMemo(
    () => buildFormSchema({ fields, layout, ...rest }, initialValues),
    [fields, layout, initialValues, rest],
  );

  // 处理提交
  const handleSubmit = async (values: Record<string, unknown>) => {
    // 直接使用表单值，不需要处理 grid 嵌套
    const finalValues = toJS(values) as Record<string, unknown>;

    // 过滤空值
    const filteredValues: Record<string, unknown> = {};
    Object.entries(finalValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filteredValues[key] = value;
      }
    });

    if (onValuesChange) {
      onValuesChange(filteredValues);
    }
    if (onSubmit) {
      await onSubmit(filteredValues);
    }
  };

  // 处理重置
  const handleReset = () => {
    // 重置表单到初始值
    form.reset('*');

    // 触发重置回调
    if (onReset) {
      onReset();
    } else if (onSubmit) {
      // 如果没有 onReset，重置后自动提交空值
      onSubmit({});
    }
  };

  // Grid 布局样式
  const gridStyle = grid
    ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.columns || 4}, 1fr)`,
        gap: grid.gutter || 16,
      }
    : undefined;

  return (
    <FormProvider form={form}>
      <FormLayout
        layout={layout}
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        {...(compact && { colon: false, labelAlign: 'left' })}
      >
        <div style={gridStyle}>
          <SchemaField schema={schema} />
        </div>
        {(showSubmit || showReset || actions) && (
          <FormButtonGroup
            style={{
              marginTop: grid ? 16 : 0,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 8,
              width: '100%',
            }}
          >
            {showSubmit && (
              <Submit onSubmit={handleSubmit} type="primary" icon={<SearchOutlined />}>
                {submitText}
              </Submit>
            )}
            {showReset && (
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                {resetText}
              </Button>
            )}
            {actions && <Space size="small">{actions}</Space>}
          </FormButtonGroup>
        )}
      </FormLayout>
    </FormProvider>
  );
}
