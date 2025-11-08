# Fidoo Blog Web - 前台网站

基于 Next.js 14 构建的现代化博客前台网站。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **HTTP 客户端**: Axios
- **表单处理**: React Hook Form + Zod
- **Markdown 渲染**: react-markdown
- **代码高亮**: highlight.js
- **UI 组件**: Radix UI

## 功能特性

### 核心功能

- ✅ 文章列表和详情页
- ✅ 分类和标签浏览
- ✅ 搜索功能
- ✅ 评论系统（支持多级回复）
- ✅ 用户认证（登录/注册）
- ✅ 用户中心和个人资料
- ✅ 响应式设计

### 页面路由

- `/` - 首页（文章列表）
- `/posts/[slug]` - 文章详情页
- `/categories` - 分类列表
- `/categories/[slug]` - 分类详情页
- `/tags` - 标签列表
- `/tags/[slug]` - 标签详情页
- `/search` - 搜索页面
- `/login` - 登录页
- `/register` - 注册页
- `/profile` - 个人中心
- `/users/[username]` - 用户主页
- `/about` - 关于页面

## 开发

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 为 `.env.local` 并配置：

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3001

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 项目结构

```
web/
├── src/
│   ├── app/              # Next.js App Router 页面
│   │   ├── layout.tsx    # 根布局
│   │   ├── page.tsx      # 首页
│   │   ├── login/        # 登录页
│   │   ├── register/     # 注册页
│   │   ├── posts/        # 文章相关页面
│   │   ├── categories/   # 分类相关页面
│   │   ├── tags/         # 标签相关页面
│   │   ├── search/       # 搜索页
│   │   ├── profile/      # 个人中心
│   │   └── users/        # 用户主页
│   ├── components/       # React 组件
│   │   ├── layout/       # 布局组件
│   │   └── post/         # 文章相关组件
│   ├── lib/             # 工具库
│   │   ├── api/         # API 客户端
│   │   └── utils/       # 工具函数
│   └── store/           # 状态管理
├── public/              # 静态资源
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

## API 集成

所有 API 调用都通过 `src/lib/api/` 目录下的模块进行：

- `client.ts` - Axios 客户端配置
- `auth.ts` - 认证相关 API
- `posts.ts` - 文章相关 API
- `categories.ts` - 分类相关 API
- `tags.ts` - 标签相关 API
- `comments.ts` - 评论相关 API

## 状态管理

使用 Zustand 进行状态管理：

- `store/auth.ts` - 用户认证状态

## 样式系统

使用 TailwindCSS 进行样式设计，主要颜色配置在 `tailwind.config.js` 中。

## 注意事项

1. 确保后端服务已启动并运行在配置的端口
2. API 请求会自动添加 JWT token（从 localStorage 读取）
3. Token 过期会自动尝试刷新
4. 未登录用户访问受保护页面会自动跳转到登录页

## License

MIT
