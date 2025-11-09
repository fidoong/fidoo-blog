# Fidoo Blog Admin - 后台管理系统

企业级博客后台管理系统，基于 Next.js 14 + TypeScript + Tailwind CSS 构建。

## 特性

- 🎨 **现代化 UI** - 基于 shadcn/ui 组件库，美观易用
- 🔐 **权限控制** - 基于角色的访问控制（RBAC）
- 📊 **数据可视化** - 丰富的统计图表和仪表盘
- 🚀 **高性能** - 使用 React Query 进行数据缓存和状态管理
- 📱 **响应式设计** - 完美适配各种设备
- 🎯 **类型安全** - 完整的 TypeScript 类型定义
- 🔄 **实时更新** - 支持数据实时刷新

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui + Radix UI
- **状态管理**: Zustand
- **数据获取**: React Query (TanStack Query)
- **表单处理**: React Hook Form + Zod
- **图标**: Lucide React

## 项目结构

```
admin/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── auth/              # 认证相关页面
│   │   ├── dashboard/         # 仪表盘
│   │   ├── posts/             # 文章管理
│   │   ├── categories/        # 分类管理
│   │   ├── tags/              # 标签管理
│   │   ├── users/             # 用户管理
│   │   ├── comments/          # 评论管理
│   │   ├── media/             # 媒体管理
│   │   └── system/            # 系统设置
│   ├── components/            # React 组件
│   │   ├── layout/           # 布局组件
│   │   ├── ui/               # UI 基础组件
│   │   └── auth/             # 认证组件
│   ├── lib/                  # 工具库
│   │   ├── api/              # API 客户端
│   │   └── utils/            # 工具函数
│   └── store/                # 状态管理
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3001

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 功能模块

### 1. 仪表盘
- 系统概览统计
- 最近文章列表
- 系统运行状态

### 2. 文章管理
- 文章列表（分页、搜索、筛选）
- 创建/编辑文章
- 文章状态管理（草稿/已发布/已归档）
- 文章删除

### 3. 分类管理
- 分类列表
- 创建/编辑分类
- 分类树形结构
- 分类删除

### 4. 标签管理
- 标签列表
- 创建/编辑标签
- 标签颜色设置
- 标签删除

### 5. 用户管理
- 用户列表（分页、搜索）
- 创建/编辑用户
- 角色管理
- 用户状态管理
- 用户删除

### 6. 评论管理
- 评论列表
- 评论审核
- 评论删除

### 7. 媒体管理
- 文件上传
- 媒体库浏览
- 文件删除

### 8. 系统设置
- 系统信息
- 进程信息
- 服务器状态

## 权限说明

系统支持三种角色：

- **admin** - 管理员：拥有所有权限
- **editor** - 编辑：可以管理内容（文章、分类、标签、评论、媒体）
- **user** - 用户：只能查看仪表盘

## 环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3005/api/v1
```

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码

### 组件规范
- 使用函数式组件
- 使用 React Hooks
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

### API 调用
- 使用 React Query 进行数据获取
- 统一错误处理
- 支持请求重试和缓存

## 参考资源

- [Next.js 文档](https://nextjs.org/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [React Query 文档](https://tanstack.com/query/latest)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

## License

MIT

