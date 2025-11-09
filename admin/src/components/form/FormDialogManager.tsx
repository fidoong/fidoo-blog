/**
 * 函数式弹窗表单管理器
 * 全新架构：基于 React Context，完全类型安全
 * 行为配置化：支持自定义按钮和多个行为
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { Modal, Button, Spin } from 'antd';
import { createForm, type Form } from '@formily/core';
import { FormProvider, createSchemaField } from '@formily/react';
import { toJS } from '@formily/reactive';
import {
  FormItem,
  Input,
  NumberPicker,
  Select,
  DatePicker,
  Switch,
  Upload,
  FormButtonGroup,
  FormLayout,
} from '@formily/antd-v5';
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
    Upload,
  },
});

/**
 * 弹窗状态
 */
interface DialogState {
  id: string;
  config: FormDialogConfig;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

/**
 * 按钮配置
 */
export interface FormDialogButtonConfig {
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
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  /**
   * 是否危险按钮
   */
  danger?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean | ((form: Form) => boolean);
  /**
   * 按钮点击事件
   * @param form Formily 表单实例
   * @param close 关闭弹窗函数
   * @param setLoading 设置加载状态函数
   */
  onClick: (
    form: Form,
    close: (result?: unknown) => void,
    setLoading: (loading: boolean) => void,
  ) => void | Promise<void>;
}

/**
 * 弹窗配置
 */
export interface FormDialogConfig extends FormSchemaConfig {
  /**
   * 弹窗标题
   */
  title?: string;
  /**
   * 弹窗宽度
   */
  width?: number | string;
  /**
   * 初始值
   */
  initialValues?: Record<string, unknown>;
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
  /**
   * 是否在取消时抛出错误（默认 false，取消时 resolve undefined）
   */
  rejectOnCancel?: boolean;
  /**
   * 自定义按钮列表（如果提供，将完全替代默认按钮）
   */
  buttons?: FormDialogButtonConfig[];
  /**
   * 自定义 Footer（如果提供，将完全替代默认按钮区域）
   */
  footer?:
    | React.ReactNode
    | ((
        form: Form,
        close: (result?: unknown) => void,
        setLoading: (loading: boolean) => void,
      ) => React.ReactNode);
  /**
   * 默认按钮配置（仅在未提供 buttons 和 footer 时使用）
   */
  defaultButtons?: {
    /**
     * 确定按钮文本
     */
    okText?: string;
    /**
     * 取消按钮文本
     */
    cancelText?: string;
    /**
     * 提交回调（用于默认确定按钮）
     */
    onSubmit?: (values: Record<string, unknown>) => Promise<unknown> | unknown;
    /**
     * 取消回调（用于默认取消按钮）
     */
    onCancel?: () => void;
    /**
     * 是否在提交后关闭弹窗（默认 true）
     */
    closeOnSubmit?: boolean;
  };
}

/**
 * 弹窗管理器 Context 类型
 */
interface FormDialogContextType {
  /**
   * 打开弹窗
   */
  openDialog: (config: FormDialogConfig) => Promise<unknown>;
}

/**
 * 弹窗管理器 Context
 */
const FormDialogContext = createContext<FormDialogContextType | null>(null);

/**
 * 使用弹窗管理器 Hook
 * 必须在 FormDialogProvider 内部使用
 */
export function useFormDialog(): FormDialogContextType {
  const context = useContext(FormDialogContext);
  if (!context) {
    throw new Error('useFormDialog 必须在 FormDialogProvider 内部使用');
  }
  return context;
}

/**
 * 弹窗管理器 Provider
 */
export function FormDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogs, setDialogs] = useState<DialogState[]>([]);
  const dialogIdCounter = useRef(0);

  const openDialog = useCallback((config: FormDialogConfig): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const id = `dialog-${++dialogIdCounter.current}`;
      const dialog: DialogState = { id, config, resolve, reject };
      setDialogs((prev) => [...prev, dialog]);
    });
  }, []);

  const closeDialog = useCallback((id: string, result?: unknown, error?: unknown) => {
    setDialogs((prev) => {
      const dialog = prev.find((d) => d.id === id);
      if (dialog) {
        if (error) {
          // 有错误，reject
          dialog.reject(error);
        } else if (result !== undefined) {
          // 有结果，resolve
          dialog.resolve(result);
        } else {
          // 取消操作：默认 resolve undefined，只有明确设置 rejectOnCancel 为 true 时才 reject
          if (dialog.config.rejectOnCancel === true) {
            dialog.reject(new Error('用户取消'));
          } else {
            dialog.resolve(undefined);
          }
        }
      }
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  // 在客户端设置全局 context（用于 showFormDialog 函数）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as { __formDialogContext?: FormDialogContextType }).__formDialogContext = {
        openDialog,
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as { __formDialogContext?: FormDialogContextType }).__formDialogContext;
      }
    };
  }, [openDialog]);

  return (
    <FormDialogContext.Provider value={{ openDialog }}>
      {children}
      {dialogs.map((dialog) => (
        <FormDialogItem
          key={dialog.id}
          dialog={dialog}
          onClose={(result, error) => closeDialog(dialog.id, result, error)}
        />
      ))}
    </FormDialogContext.Provider>
  );
}

/**
 * 弹窗项组件
 */
function FormDialogItem({
  dialog,
  onClose,
}: {
  dialog: DialogState;
  onClose: (result?: unknown, error?: unknown) => void;
}) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<Form | null>(null);

  // 创建表单实例（每个弹窗只创建一次）
  const form = React.useMemo(() => {
    if (!formRef.current) {
      formRef.current = createForm({
        initialValues: dialog.config.initialValues || {},
        validateFirst: true,
      });
    }
    return formRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog.id]);

  // 当 initialValues 变化时更新表单值
  useEffect(() => {
    if (dialog.config.initialValues && formRef.current) {
      formRef.current.setValues(dialog.config.initialValues);
    }
  }, [dialog.config.initialValues]);

  // 构建 Schema
  const schema = React.useMemo(
    () => buildFormSchema(dialog.config, dialog.config.initialValues || {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dialog.config],
  );

  // 关闭弹窗的包装函数
  const handleClose = useCallback(
    (result?: unknown) => {
      onClose(result);
    },
    [onClose],
  );

  // 渲染 Footer
  const renderFooter = () => {
    // 如果提供了自定义 footer
    if (dialog.config.footer) {
      if (typeof dialog.config.footer === 'function') {
        return dialog.config.footer(form, handleClose, setLoading);
      }
      return dialog.config.footer;
    }

    // 如果提供了自定义按钮列表
    if (dialog.config.buttons && dialog.config.buttons.length > 0) {
      return (
        <FormButtonGroup
          style={{
            marginTop: 24,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          {dialog.config.buttons.map((buttonConfig) => {
            const isDisabled =
              typeof buttonConfig.disabled === 'function'
                ? buttonConfig.disabled(form)
                : buttonConfig.disabled || loading;

            return (
              <Button
                key={buttonConfig.key}
                type={buttonConfig.type}
                danger={buttonConfig.danger}
                disabled={isDisabled}
                onClick={() => {
                  const result = buttonConfig.onClick(form, handleClose, setLoading);
                  // 如果是 Promise，处理加载状态
                  if (result instanceof Promise) {
                    setLoading(true);
                    result
                      .then(() => {
                        setLoading(false);
                      })
                      .catch((error) => {
                        setLoading(false);
                        throw error;
                      });
                  }
                }}
              >
                {buttonConfig.text}
              </Button>
            );
          })}
        </FormButtonGroup>
      );
    }

    // 默认按钮（向后兼容）
    const defaultButtons = dialog.config.defaultButtons || {};
    const handleSubmit = async () => {
      try {
        setLoading(true);
        const formValues = toJS(form.values) as Record<string, unknown>;

        if (defaultButtons.onSubmit) {
          const result = await defaultButtons.onSubmit(formValues);
          if (defaultButtons.closeOnSubmit !== false) {
            handleClose(result);
          }
        } else {
          if (defaultButtons.closeOnSubmit !== false) {
            handleClose(formValues);
          }
        }
      } catch (error) {
        onClose(undefined, error);
        throw error;
      } finally {
        setLoading(false);
      }
    };

    const handleCancel = () => {
      if (defaultButtons.onCancel) {
        defaultButtons.onCancel();
      }
      handleClose();
    };

    return (
      <FormButtonGroup
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}
      >
        <Button onClick={handleCancel} disabled={loading}>
          {defaultButtons.cancelText || '取消'}
        </Button>
        <Button type="primary" onClick={handleSubmit} disabled={loading}>
          {defaultButtons.okText || '确定'}
        </Button>
      </FormButtonGroup>
    );
  };

  const isLoading = loading || dialog.config.loading || false;

  return (
    <Modal
      open={true}
      title={dialog.config.title || '表单'}
      width={dialog.config.width || 600}
      onCancel={() => handleClose()}
      footer={null}
      destroyOnClose
      maskClosable={false}
      keyboard={false}
    >
      <Spin spinning={isLoading}>
        <FormProvider form={form}>
          <FormLayout layout={dialog.config.layout || 'vertical'}>
            <SchemaField schema={schema} />
            {renderFooter()}
          </FormLayout>
        </FormProvider>
      </Spin>
    </Modal>
  );
}

/**
 * 显示弹窗表单（函数式调用）
 * 必须在 FormDialogProvider 内部使用
 *
 * 注意：此函数需要在组件内部调用，因为它依赖于 React Context
 * 如果需要在组件外部调用，请使用 useFormDialog Hook
 */
export function showFormDialog(config: FormDialogConfig): Promise<unknown> {
  // 在服务端渲染时抛出错误
  if (typeof window === 'undefined') {
    throw new Error('showFormDialog 只能在客户端使用');
  }

  // 尝试从全局获取 context（由 FormDialogProvider 设置）
  const context = (window as { __formDialogContext?: FormDialogContextType }).__formDialogContext;
  if (context) {
    return context.openDialog(config);
  }

  throw new Error(
    'showFormDialog 必须在 FormDialogProvider 内部使用。请确保在根布局中添加了 <FormDialogProvider>',
  );
}
