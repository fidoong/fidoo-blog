# SchemaForm 组件使用文档

基于 Formily 的配置化表单组件，支持表格搜索、弹窗表单等场景。

## 组件列表

### 1. SchemaForm
基础的配置化表单组件，支持所有 Formily 功能。

### 2. TableSearchForm
专门用于表格搜索的表单组件，内置卡片容器和折叠功能。

### 3. FormDialog (showFormDialog)
函数式弹窗表单，支持 Promise 风格的调用。

## 使用示例

### SchemaForm 基础用法

```tsx
import { SchemaForm } from '@/components/form/SchemaForm';

const searchFields = [
  {
    name: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
  },
  {
    name: 'role',
    label: '角色',
    type: 'select',
    placeholder: '请选择角色',
    options: [
      { label: '全部', value: '' },
      { label: '管理员', value: 'admin' },
      { label: '用户', value: 'user' },
    ],
  },
];

function MyComponent() {
  const handleSearch = (values: Record<string, unknown>) => {
    console.log('搜索参数:', values);
    // 执行搜索逻辑
  };

  return (
    <SchemaForm
      fields={searchFields}
      layout="inline"
      compact
      onSubmit={handleSearch}
      submitText="查询"
      resetText="重置"
    />
  );
}
```

### TableSearchForm 表格搜索

```tsx
import { TableSearchForm } from '@/components/form/TableSearchForm';
import { Table } from 'antd';

const searchConfig = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      type: 'input' as const,
      placeholder: '请输入用户名',
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input' as const,
      placeholder: '请输入邮箱',
    },
    {
      name: 'role',
      label: '角色',
      type: 'select' as const,
      options: [
        { label: '全部', value: '' },
        { label: '管理员', value: 'admin' },
      ],
    },
  ],
};

function UsersPage() {
  const [searchParams, setSearchParams] = useState({});

  const handleSearch = (values: Record<string, unknown>) => {
    // 过滤空值
    const params: Record<string, unknown> = {};
    Object.keys(values).forEach((key) => {
      const value = values[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    setSearchParams(params);
  };

  return (
    <div>
      <TableSearchForm
        {...searchConfig}
        title="搜索用户"
        onSubmit={handleSearch}
        onReset={() => handleSearch({})}
      />
      <Table dataSource={data} columns={columns} />
    </div>
  );
}
```

### showFormDialog 弹窗表单

```tsx
import { showFormDialog } from '@/components/form/FormDialog';

async function handleCreate() {
  try {
    const values = await showFormDialog({
      title: '创建用户',
      fields: [
        {
          name: 'username',
          label: '用户名',
          type: 'input',
          required: true,
        },
        {
          name: 'email',
          label: '邮箱',
          type: 'input',
          required: true,
        },
      ],
      onSubmit: async (formValues) => {
        await api.createUser(formValues);
      },
    });
    message.success('创建成功');
  } catch (error) {
    // 用户取消或提交失败
  }
}
```

## 字段类型支持

- `input` - 文本输入框
- `textarea` - 多行文本
- `number` - 数字输入
- `select` - 下拉选择
- `date` - 日期选择
- `dateRange` - 日期范围
- `switch` - 开关
- `upload` - 文件上传
- `treeSelect` - 树形选择
- `cascader` - 级联选择

## 高级功能

### 字段依赖

```tsx
{
  name: 'city',
  label: '城市',
  type: 'select',
  dependencies: ['province'],
  visible: (values) => !!values.province,
}
```

### 条件禁用

```tsx
{
  name: 'code',
  label: '编码',
  type: 'input',
  disabled: (values) => !!values.id, // 编辑时禁用
}
```

### 自定义验证

```tsx
{
  name: 'email',
  label: '邮箱',
  type: 'input',
  rules: [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
  ],
}
```

## API 参考

### SchemaForm Props

| 属性 | 类型 | 说明 |
|------|------|------|
| fields | FieldConfig[] | 字段配置数组 |
| layout | 'vertical' \| 'horizontal' \| 'inline' | 布局方式 |
| initialValues | Record<string, unknown> | 初始值 |
| onSubmit | (values) => void | 提交回调 |
| onReset | () => void | 重置回调 |
| onValuesChange | (values) => void | 值变化回调（提交时触发） |
| submitText | string | 提交按钮文本 |
| resetText | string | 重置按钮文本 |
| showSubmit | boolean | 是否显示提交按钮 |
| showReset | boolean | 是否显示重置按钮 |
| compact | boolean | 紧凑模式 |

### TableSearchForm Props

继承 SchemaForm 的所有属性，额外提供：

| 属性 | 类型 | 说明 |
|------|------|------|
| card | boolean | 是否显示卡片容器 |
| title | string | 卡片标题 |
| defaultExpand | boolean | 默认是否展开 |
| collapsible | boolean | 是否可折叠 |
| value | Record<string, unknown> | 受控值 |
| onChange | (values) => void | 值变化回调 |

