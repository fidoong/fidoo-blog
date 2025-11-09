# Fidoo Blog 企业级后台管理系统

基于 Formily + Ant Design 的企业级后台管理系统，支持配置化页面开发、权限控制、函数式弹窗表单等功能。

## 特性

- ✅ **配置化页面开发** - 基于 Schema 配置快速构建表单和表格页面
- ✅ **权限系统集成** - 完整的菜单、路由、按钮权限控制
- ✅ **函数式弹窗表单** - Promise 风格的弹窗表单提交
- ✅ **Formily 集成** - 强大的表单解决方案
- ✅ **Ant Design 5** - 现代化的 UI 组件库
- ✅ **TypeScript** - 完整的类型支持
- ✅ **Next.js 14** - 基于 App Router 的路由系统

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI 库**: Ant Design 5
- **表单**: Formily 2.x
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **类型**: TypeScript

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
pnpm dev
```

访问 http://localhost:3001

### 构建

```bash
pnpm build
```

### 启动生产环境

```bash
pnpm start
```

## 核心功能

### 1. 配置化页面开发

通过 Schema 配置快速构建页面：

```typescript
const formConfig: FormSchemaConfig = {
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
};

const schema = buildFormSchema(formConfig);
```

### 2. 函数式弹窗表单

Promise 风格的弹窗表单：

```typescript
try {
  const values = await showFormDialog({
    title: '创建用户',
    fields: [...],
    onSubmit: async (values) => {
      await api.createUser(values);
    },
  });
  message.success('创建成功');
} catch (error) {
  // 用户取消或提交失败
}
```

### 3. 权限控制

#### 按钮权限

```tsx
<Permission permission="users:create">
  <Button>创建用户</Button>
</Permission>
```

#### 路由权限

```tsx
<ProtectedRoute permission="users:view">
  <UsersPage />
</ProtectedRoute>
```

### 4. 菜单权限

菜单通过后端接口动态加载，根据用户权限自动过滤。

## 项目结构

```
admin/
├── src/
│   ├── app/              # Next.js App Router 页面
│   │   ├── (admin)/      # 需要认证的管理页面
│   │   └── auth/         # 认证相关页面
│   ├── components/       # 组件
│   │   ├── form/         # 表单组件
│   │   ├── layout/       # 布局组件
│   │   └── auth/         # 认证组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具库
│   │   ├── api/          # API 客户端
│   │   └── schema/       # Schema 构建器
│   └── store/            # 状态管理
└── package.json
```

## API 集成

系统使用统一的 API 客户端，支持：

- 自动 Token 刷新
- 请求/响应拦截
- 错误处理
- 类型安全

## 权限系统

系统支持完整的 RBAC 权限控制：

- **菜单权限**: 控制菜单显示/隐藏
- **路由权限**: 控制页面访问
- **按钮权限**: 控制按钮操作

权限编码格式：`资源:操作`，例如：
- `users:create` - 创建用户
- `users:update` - 更新用户
- `users:delete` - 删除用户
- `users:view` - 查看用户

## 开发指南

### 创建新页面

1. 在 `src/app/(admin)/` 下创建页面文件
2. 使用 Schema 配置定义表单和表格
3. 使用 `showFormDialog` 实现弹窗表单
4. 使用 `Permission` 组件控制权限

### 添加 API

1. 在 `src/lib/api/` 下创建 API 文件
2. 使用 `apiClient` 发送请求
3. 定义 TypeScript 类型

## 环境变量

```env
NEXT_PUBLIC_API_URL=http://localhost:3005/api/v1
```

## License

MIT

