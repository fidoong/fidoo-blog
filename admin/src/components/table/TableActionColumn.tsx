/**
 * 表格操作列组件
 * 支持配置化的操作按钮（编辑、删除等）
 * - 多个操作：hover 显示下拉菜单
 * - 单个操作：直接显示按钮，支持 confirm
 */

'use client';

import React from 'react';
import { Button, Popconfirm, Dropdown, Modal, type MenuProps } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Permission } from '@/hooks/usePermissions';
import type { ButtonProps } from 'antd';

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  EditOutlined: <EditOutlined />,
  DeleteOutlined: <DeleteOutlined />,
  MoreOutlined: <MoreOutlined />,
};

/**
 * 操作按钮配置
 */
export interface TableActionButtonConfig<T = unknown> {
  /**
   * 按钮唯一标识
   */
  key: string;
  /**
   * 按钮文本
   */
  text: string;
  /**
   * 按钮图标（支持字符串或 ReactNode）
   */
  icon?: string | React.ReactNode;
  /**
   * 是否危险按钮
   */
  danger?: boolean;
  /**
   * 是否禁用（支持函数，基于记录数据）
   */
  disabled?: boolean | ((record: T) => boolean);
  /**
   * 权限码（需要权限控制时使用）
   */
  permission?: string;
  /**
   * 按钮点击事件（外部函数调用）
   */
  onClick: (record: T) => void | Promise<void>;
  /**
   * 是否显示确认对话框（用于删除等危险操作）
   */
  confirm?: {
    title: string;
    description?: string;
    disabled?: boolean | ((record: T) => boolean);
  };
  /**
   * 自定义渲染函数（用于更复杂的按钮）
   */
  render?: (record: T) => React.ReactNode;
  /**
   * 额外的按钮属性
   */
  buttonProps?: Omit<ButtonProps, 'onClick' | 'type' | 'icon' | 'danger' | 'disabled'>;
}

/**
 * 操作列配置
 */
export interface TableActionColumnConfig<T = unknown> {
  /**
   * 操作按钮列表
   */
  actions: TableActionButtonConfig<T>[];
  /**
   * 列标题（默认：操作）
   */
  title?: string;
  /**
   * 列宽度（默认：80）
   */
  width?: number | string;
  /**
   * 是否固定在右侧（默认：true）
   */
  fixed?: 'left' | 'right' | false;
  /**
   * 对齐方式（默认：center）
   */
  align?: 'left' | 'center' | 'right';
  /**
   * 触发方式（默认：hover）
   */
  trigger?: 'click' | 'hover';
}

/**
 * 表格操作列组件
 */
export function TableActionColumn<T = unknown>({
  actions,
  title = '操作',
  width = 80,
  fixed = 'right',
  align = 'center',
  trigger = 'hover',
}: TableActionColumnConfig<T>) {
  /**
   * 渲染操作列
   */
  const renderActions = (_: unknown, record: T) => {
    // 如果只有一个操作，直接显示按钮
    if (actions.length === 1) {
      const action = actions[0];

      // 如果有自定义渲染函数，使用自定义渲染
      if (action.render) {
        return <React.Fragment>{action.render(record)}</React.Fragment>;
      }

      // 处理禁用状态
      const isDisabled =
        typeof action.disabled === 'function' ? !!action.disabled(record) : !!action.disabled;

      // 处理图标
      let icon: React.ReactNode = null;
      if (action.icon) {
        if (typeof action.icon === 'string') {
          icon = iconMap[action.icon] || null;
        } else {
          icon = action.icon;
        }
      }

      // 构建按钮
      const button = (
        <Button
          type="link"
          size="small"
          icon={icon}
          danger={action.danger}
          disabled={isDisabled}
          onClick={() => action.onClick(record)}
          style={{ padding: 0, height: 'auto', ...action.buttonProps?.style }}
          {...action.buttonProps}
        >
          {action.text}
        </Button>
      );

      // 如果有确认对话框
      if (action.confirm) {
        const confirmDisabled =
          typeof action.confirm.disabled === 'function'
            ? !!action.confirm.disabled(record)
            : !!action.confirm.disabled;

        const buttonWithConfirm = (
          <Popconfirm
            title={action.confirm.title}
            description={action.confirm.description}
            onConfirm={() => action.onClick(record)}
            disabled={confirmDisabled}
            okText="确定"
            cancelText="取消"
          >
            {button}
          </Popconfirm>
        );

        // 如果有权限控制
        if (action.permission) {
          return <Permission permission={action.permission}>{() => buttonWithConfirm}</Permission>;
        }

        return buttonWithConfirm;
      }

      // 如果有权限控制
      if (action.permission) {
        return <Permission permission={action.permission}>{() => button}</Permission>;
      }

      return button;
    }

    // 多个操作：使用下拉菜单
    const menuItems: MenuProps['items'] = actions
      .map((action) => {
        // 如果有自定义渲染，跳过（下拉菜单不支持自定义渲染）
        if (action.render) {
          return null;
        }

        // 处理禁用状态
        const isDisabled =
          typeof action.disabled === 'function' ? !!action.disabled(record) : !!action.disabled;

        // 处理图标
        let icon: React.ReactNode = null;
        if (action.icon) {
          if (typeof action.icon === 'string') {
            icon = iconMap[action.icon] || null;
          } else {
            icon = action.icon;
          }
        }

        return {
          key: action.key,
          label: action.text,
          icon,
          danger: action.danger,
          disabled: isDisabled,
          onClick: () => {
            // 如果有确认对话框
            if (action.confirm) {
              const confirmDisabled =
                typeof action.confirm.disabled === 'function'
                  ? !!action.confirm.disabled(record)
                  : !!action.confirm.disabled;

              if (confirmDisabled) {
                return;
              }

              // 使用 Modal.confirm 显示确认对话框
              Modal.confirm({
                title: action.confirm.title,
                content: action.confirm.description,
                okText: '确定',
                cancelText: '取消',
                onOk: () => {
                  action.onClick(record);
                },
              });
            } else {
              action.onClick(record);
            }
          },
        };
      })
      .filter(Boolean) as MenuProps['items'];

    const dropdownButton = (
      <Button
        type="link"
        size="small"
        icon={<MoreOutlined />}
        style={{ padding: 0, height: 'auto' }}
      >
        操作
      </Button>
    );

    return (
      <Dropdown menu={{ items: menuItems }} trigger={[trigger]} placement="bottomRight">
        {dropdownButton}
      </Dropdown>
    );
  };

  // 返回表格列配置
  return {
    key: 'actions',
    title,
    dataIndex: 'actions',
    width,
    fixed: fixed === false ? undefined : fixed,
    align,
    render: renderActions,
  };
}
