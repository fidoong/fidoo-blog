/**
 * Schema 配置类型定义
 */

/**
 * 字段配置
 */
export interface FieldConfig {
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'number' | 'select' | 'date' | 'dateRange' | 'switch' | 'upload' | 'editor' | 'treeSelect' | 'cascader';
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  props?: Record<string, any>;
  rules?: any[];
  dependencies?: string[];
  visible?: (values: any) => boolean;
  disabled?: boolean | ((values: any) => boolean);
  component?: string; // 自定义组件
  componentProps?: Record<string, any>;
}

/**
 * 表单 Schema 配置
 */
export interface FormSchemaConfig {
  fields: FieldConfig[];
  layout?: 'vertical' | 'horizontal' | 'inline';
  labelCol?: number;
  wrapperCol?: number;
  submitText?: string;
  cancelText?: string;
  grid?: {
    gutter?: number;
    columns?: number;
  };
}

/**
 * 表格列配置
 */
export interface TableColumnConfig {
  key: string;
  title: string;
  dataIndex: string;
  width?: number | string;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  sorter?: boolean | ((a: any, b: any) => number);
  filters?: Array<{ text: string; value: any }>;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  formily?: {
    type?: string;
    props?: Record<string, any>;
  };
}

/**
 * 表格 Schema 配置
 */
export interface TableSchemaConfig {
  columns: TableColumnConfig[];
  rowKey?: string;
  pagination?: boolean | {
    pageSize?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
  rowSelection?: boolean | {
    type?: 'checkbox' | 'radio';
    onChange?: (selectedRowKeys: any[], selectedRows: any[]) => void;
  };
}

/**
 * 页面 Schema 配置
 */
export interface PageSchemaConfig {
  title?: string;
  breadcrumb?: Array<{ title: string; path?: string }>;
  form?: FormSchemaConfig;
  table?: TableSchemaConfig;
  actions?: Array<{
    key: string;
    label: string;
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    icon?: string;
    permission?: string;
    onClick?: (record?: any) => void | Promise<void>;
  }>;
}

