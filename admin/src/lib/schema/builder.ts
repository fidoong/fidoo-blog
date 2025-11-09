/**
 * Schema 构建器
 * 将配置转换为 Formily Schema
 */

import type { FormSchemaConfig, FieldConfig, TableSchemaConfig } from './types';

// Formily Schema 类型
type ISchema = Record<string, any>;

/**
 * 将字段配置转换为 Formily Schema
 */
function fieldToFormilySchema(field: FieldConfig, formValues: any = {}): ISchema {
  const schema: ISchema = {
    type: 'string',
    title: field.label,
    required: field.required,
    'x-decorator': 'FormItem',
    'x-component': getFormilyComponent(field.type),
    'x-component-props': {
      placeholder: field.placeholder,
      ...field.props,
      ...field.componentProps,
    },
  };

  // 处理默认值
  if (field.defaultValue !== undefined) {
    schema.default = field.defaultValue;
  }

  // 处理枚举类型（select, radio 等）
  if (field.options && field.options.length > 0) {
    schema.enum = field.options.map((opt) => opt.value);
    schema['x-component-props'] = {
      ...schema['x-component-props'],
      options: field.options,
    };
  }

  // 处理验证规则
  if (field.rules && field.rules.length > 0) {
    schema.validator = field.rules;
  }

  // 处理依赖关系
  if (field.dependencies && field.dependencies.length > 0) {
    schema['x-reactions'] = field.dependencies.map((dep) => ({
      dependencies: [dep],
      fulfill: {
        state: {
          visible: field.visible ? `{{$deps[0] && ${field.visible.toString()}}}` : true,
          disabled: field.disabled ? `{{$deps[0] && ${field.disabled.toString()}}}` : false,
        },
      },
    }));
  } else {
    // 直接使用 visible 和 disabled
    if (field.visible) {
      schema['x-reactions'] = {
        fulfill: {
          state: {
            visible: field.visible(formValues),
          },
        },
      };
    }
    if (field.disabled !== undefined) {
      if (typeof field.disabled === 'boolean') {
        schema['x-component-props'] = {
          ...schema['x-component-props'],
          disabled: field.disabled,
        };
      } else {
        schema['x-reactions'] = {
          fulfill: {
            state: {
              disabled: field.disabled(formValues),
            },
          },
        };
      }
    }
  }

  return schema;
}

/**
 * 获取 Formily 组件名称
 */
function getFormilyComponent(type: FieldConfig['type']): string {
  const componentMap: Record<string, string> = {
    input: 'Input',
    textarea: 'Input.TextArea',
    number: 'NumberPicker',
    select: 'Select',
    date: 'DatePicker',
    dateRange: 'DatePicker.RangePicker',
    switch: 'Switch',
    upload: 'Upload',
    editor: 'RichTextEditor',
    treeSelect: 'TreeSelect',
    cascader: 'Cascader',
  };

  return componentMap[type] || 'Input';
}

/**
 * 构建表单 Schema
 */
export function buildFormSchema(config: FormSchemaConfig, formValues: any = {}): ISchema {
  // 不再使用 FormGrid 嵌套字段，直接返回字段
  // Grid 布局由 CSS 处理，不嵌套字段值
  const properties: Record<string, ISchema> = {};
  config.fields.forEach((field) => {
    properties[field.name] = fieldToFormilySchema(field, formValues);
  });

  return {
    type: 'object',
    properties,
  };
}

/**
 * 构建表格列配置（用于 Ant Design Table）
 */
export function buildTableColumns(config: TableSchemaConfig): any[] {
  return config.columns.map((col) => ({
    key: col.key,
    title: col.title,
    dataIndex: col.dataIndex,
    width: col.width,
    fixed: col.fixed,
    align: col.align,
    sorter: col.sorter,
    filters: col.filters,
    render: col.render,
  }));
}
