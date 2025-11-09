/**
 * 函数式 Promise 弹窗表单组件
 * 基于 Formily + Ant Design
 *
 * 使用方式：
 * 1. 在根布局中添加 <FormDialogProvider>
 * 2. 使用 showFormDialog 或 useFormDialog Hook
 */

'use client';

export {
  showFormDialog,
  FormDialogProvider,
  useFormDialog,
  type FormDialogConfig,
} from './FormDialogManager';
