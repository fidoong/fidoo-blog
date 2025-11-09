/**
 * 表格工具栏组件
 * 用于在表格上方显示操作按钮（如创建、批量删除、导出等）
 * 支持配置化方式定义按钮
 */

'use client';

import React from 'react';
import { Space, Button, Popconfirm } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Permission } from '@/hooks/usePermissions';
import type { ButtonProps } from 'antd';

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  PlusOutlined: <PlusOutlined />,
  EditOutlined: <EditOutlined />,
  DeleteOutlined: <DeleteOutlined />,
  ExportOutlined: <ExportOutlined />,
  ReloadOutlined: <ReloadOutlined />,
  DownloadOutlined: <DownloadOutlined />,
  UploadOutlined: <UploadOutlined />,
};

/**
 * 按钮配置
 */
export interface TableToolButtonConfig {
  /**
   * 按钮唯一标识
   */
  key: string;
  /**
   * 按钮文本
   */
  text: string;
  /**
   * 按钮类型
   */
  type?: ButtonProps['type'];
  /**
   * 按钮图标（支持字符串或 ReactNode）
   */
  icon?: string | React.ReactNode;
  /**
   * 按钮点击事件
   */
  onClick?: () => void | Promise<void>;
  /**
   * 权限码（需要权限控制时使用）
   */
  permission?: string;
  /**
   * 是否危险按钮
   */
  danger?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 是否显示确认对话框（用于删除等危险操作）
   */
  confirm?: {
    title: string;
    description?: string;
    onConfirm: () => void | Promise<void>;
  };
  /**
   * 自定义渲染函数（用于更复杂的按钮）
   */
  render?: () => React.ReactNode;
  /**
   * 额外的按钮属性
   */
  buttonProps?: Omit<ButtonProps, 'onClick' | 'type' | 'icon' | 'danger' | 'disabled'>;
}

/**
 * TableTool 配置
 */
export interface TableToolConfig {
  /**
   * 按钮配置列表
   */
  actions?: TableToolButtonConfig[];
  /**
   * 是否右对齐（默认 true）
   */
  alignRight?: boolean;
  /**
   * 额外的样式
   */
  style?: React.CSSProperties;
}

export interface TableToolProps {
  /**
   * 配置化方式（推荐）
   */
  config?: TableToolConfig;
  /**
   * 操作按钮列表（兼容旧版本）
   */
  actions?: React.ReactNode[];
  /**
   * 自定义内容（用于更灵活的布局）
   */
  children?: React.ReactNode;
  /**
   * 是否右对齐（默认 true）
   */
  alignRight?: boolean;
  /**
   * 额外的样式
   */
  style?: React.CSSProperties;
}

/**
 * 渲染单个按钮
 */
function renderButton(config: TableToolButtonConfig): React.ReactNode {
  // 如果有自定义渲染函数，使用自定义渲染
  if (config.render) {
    return config.render();
  }

  // 处理图标
  let icon: React.ReactNode = null;
  if (config.icon) {
    if (typeof config.icon === 'string') {
      icon = iconMap[config.icon] || null;
    } else {
      icon = config.icon;
    }
  }

  // 构建按钮
  const button = (
    <Button
      type={config.type}
      icon={icon}
      danger={config.danger}
      disabled={config.disabled}
      onClick={config.onClick}
      {...config.buttonProps}
    >
      {config.text}
    </Button>
  );

  // 如果有确认对话框
  if (config.confirm) {
    return (
      <Popconfirm
        key={config.key}
        title={config.confirm.title}
        description={config.confirm.description}
        onConfirm={config.confirm.onConfirm}
        okText="确定"
        cancelText="取消"
      >
        {button}
      </Popconfirm>
    );
  }

  // 如果有权限控制
  if (config.permission) {
    return (
      <Permission key={config.key} permission={config.permission}>
        {() => button}
      </Permission>
    );
  }

  return <React.Fragment key={config.key}>{button}</React.Fragment>;
}

/**
 * 表格工具栏组件
 */
export function TableTool({ config, actions, children, alignRight = true, style }: TableToolProps) {
  // 优先使用配置化方式
  if (config) {
    const { actions: configActions, alignRight: configAlignRight, style: configStyle } = config;
    const finalAlignRight = configAlignRight !== undefined ? configAlignRight : alignRight;
    const finalStyle = { ...style, ...configStyle };

    if (!configActions || configActions.length === 0) {
      if (!children) {
        return null;
      }
    }

    return (
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: finalAlignRight ? 'flex-end' : 'flex-start',
          alignItems: 'center',
          ...finalStyle,
        }}
      >
        {children ||
          (configActions && configActions.length > 0 && (
            <Space>{configActions.map((action) => renderButton(action))}</Space>
          ))}
      </div>
    );
  }

  // 兼容旧版本：使用 actions 数组
  if (!actions && !children) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: 16,
        display: 'flex',
        justifyContent: alignRight ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        ...style,
      }}
    >
      {children || (actions && actions.length > 0 && <Space>{actions}</Space>)}
    </div>
  );
}
