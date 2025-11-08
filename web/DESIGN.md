# Fidoo Blog Web - 设计文档

## 项目概述

基于 Next.js 14 构建的现代化博客前台网站，参考掘金（Juejin）的设计理念，提供完整的博客阅读、搜索、评论等功能。

## 技术架构

### 核心技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **状态管理**: Zustand (带持久化)
- **数据获取**: TanStack Query (React Query)
- **HTTP 客户端**: Axios (带拦截器)
- **表单处理**: React Hook Form + Zod
- **Markdown 渲染**: react-markdown + remark/rehype 插件
- **代码高亮**: highlight.js
- **图标**: Lucide React
- **UI 组件**: Radix UI (部分使用)

### 设计原则

1. **组件化设计**: 高度可复用的组件结构
2. **类型安全**: 完整的 TypeScript 类型定义
3. **响应式设计**: 移动端优先的响应式布局
4. **性能优化**:
   - 使用 React Query 进行数据缓存
   - 图片懒加载
   - 代码分割
5. **用户体验**:
   - 加载状态提示
   - 错误处理
   - 平滑的页面过渡

## 项目结构

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx            # 首页
│   │   ├── globals.css         # 全局样式
│   │   ├── providers.tsx       # 全局 Provider
│   │   ├── login/              # 登录页
│   │   ├── register/           # 注册页
│   │   ├── posts/[slug]/       # 文章详情页
│   │   ├── categories/         # 分类相关页面
│   │   ├── tags/              # 标签相关页面
│   │   ├── search/            # 搜索页
│   │   ├── profile/           # 个人中心
│   │   ├── users/[username]/  # 用户主页
│   │   └── about/             # 关于页面
│   ├── components/            # React 组件
│   │   ├── layout/            # 布局组件
│   │   │   ├── Header.tsx     # 头部导航
│   │   │   ├── Footer.tsx     # 页脚
│   │   │   ├── MainLayout.tsx # 主布局
│   │   │   └── Sidebar.tsx   # 侧边栏
│   │   └── post/              # 文章相关组件
│   │       ├── PostCard.tsx   # 文章卡片
│   │       ├── PostList.tsx   # 文章列表
│   │       ├── PostContent.tsx # 文章内容
│   │       ├── PostComments.tsx # 评论组件
│   │       └── PostListSkeleton.tsx # 加载骨架
│   ├── lib/                   # 工具库
│   │   ├── api/               # API 客户端
│   │   │   ├── client.ts      # Axios 配置
│   │   │   ├── types.ts       # API 类型定义
│   │   │   ├── auth.ts        # 认证 API
│   │   │   ├── posts.ts       # 文章 API
│   │   │   ├── categories.ts  # 分类 API
│   │   │   ├── tags.ts        # 标签 API
│   │   │   └── comments.ts    # 评论 API
│   │   └── utils/             # 工具函数
│   │       ├── cn.ts          # className 合并
│   │       └── format.ts      # 格式化函数
│   └── store/                 # 状态管理
│       └── auth.ts            # 认证状态
├── public/                    # 静态资源
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 核心功能实现

### 1. 认证系统

- **登录/注册**: 使用 React Hook Form + Zod 进行表单验证
- **JWT 管理**:
  - Token 存储在 localStorage
  - 自动添加到请求头
  - Token 过期自动刷新
- **状态管理**: Zustand 持久化存储用户信息

### 2. 文章系统

- **文章列表**:
  - 支持分页
  - 支持筛选（分类、标签、状态）
  - 支持搜索
  - 响应式网格布局
- **文章详情**:
  - Markdown 渲染
  - 代码高亮
  - 自动增加浏览量
  - 相关文章推荐

### 3. 评论系统

- **多级评论**: 支持回复评论
- **实时更新**: 使用 React Query 自动刷新
- **用户认证**: 未登录用户提示登录

### 4. 搜索功能

- **关键词搜索**: 支持文章标题和内容搜索
- **URL 参数**: 搜索关键词通过 URL 参数传递

### 5. 分类和标签

- **分类浏览**: 按分类筛选文章
- **标签浏览**: 按标签筛选文章
- **侧边栏展示**: 热门分类和标签

## API 集成

### API 客户端设计

所有 API 调用都通过统一的客户端进行：

```typescript
// 自动添加 JWT token
// 自动处理 token 刷新
// 统一的错误处理
```

### API 模块

- `auth.ts`: 用户认证相关
- `posts.ts`: 文章 CRUD
- `categories.ts`: 分类查询
- `tags.ts`: 标签查询
- `comments.ts`: 评论 CRUD

## 样式系统

### TailwindCSS 配置

- 自定义主色调（primary）
- 响应式断点
- 工具类扩展

### 全局样式

- Markdown 内容样式
- 代码高亮样式
- 自定义滚动条

## 性能优化

1. **数据缓存**: React Query 自动缓存 API 响应
2. **代码分割**: Next.js 自动代码分割
3. **图片优化**: Next.js Image 组件自动优化
4. **懒加载**: 组件和图片懒加载

## 用户体验

1. **加载状态**: 骨架屏和加载提示
2. **错误处理**: 友好的错误提示
3. **响应式设计**: 移动端适配
4. **无障碍**: 语义化 HTML 和 ARIA 属性

## 参考设计

参考掘金（Juejin）的设计：

- 左侧导航栏（分类）
- 中间内容区域（文章列表/详情）
- 右侧侧边栏（热门内容）
- 顶部导航栏（搜索、用户信息）
- 文章卡片设计
- 评论系统设计

## 后续优化

1. **SEO 优化**: 添加 meta 标签和结构化数据
2. **PWA 支持**: 添加 Service Worker
3. **暗色模式**: 支持主题切换
4. **国际化**: 支持多语言
5. **性能监控**: 添加性能分析
6. **错误追踪**: 集成错误监控服务

## 部署

### 环境变量

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 构建命令

```bash
pnpm build
pnpm start
```

### Docker 部署

可以配合项目的 docker-compose.yml 进行容器化部署。
