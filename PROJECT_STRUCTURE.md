# 项目结构说明

## 完整目录树

```
fidoo-blog/
├── .github/                    # GitHub 配置
├── .husky/                     # Git Hooks
├── .vscode/                    # VSCode 配置
│   ├── extensions.json        # 推荐扩展
│   └── settings.json          # 编辑器设置
├── docs/                       # 项目文档
│   ├── ARCHITECTURE.md        # 架构设计
│   ├── API.md                 # API 文档
│   ├── DEPLOYMENT.md          # 部署指南
│   └── QUICKSTART.md          # 快速开始
├── docker/                     # Docker 配置
│   └── nginx/
│       └── nginx.conf         # Nginx 配置
├── scripts/                    # 辅助脚本
│   ├── setup.sh               # 初始化脚本
│   └── dev.sh                 # 开发环境启动脚本
├── service/                    # 后端服务 (NestJS)
│   ├── src/
│   │   ├── main.ts            # 应用入口
│   │   ├── app.module.ts      # 根模块
│   │   ├── app.controller.ts  # 根控制器
│   │   ├── app.service.ts     # 根服务
│   │   ├── config/            # 配置模块
│   │   │   ├── app.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   └── jwt.config.ts
│   │   ├── common/            # 公共模块
│   │   │   ├── decorators/    # 装饰器
│   │   │   │   ├── public.decorator.ts
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── current-user.decorator.ts
│   │   │   ├── filters/       # 异常过滤器
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── guards/        # 守卫
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── interceptors/  # 拦截器
│   │   │   │   └── transform.interceptor.ts
│   │   │   └── logger/        # 日志服务
│   │   │       ├── logger.module.ts
│   │   │       └── logger.service.ts
│   │   ├── database/          # 数据库层
│   │   │   ├── base.entity.ts
│   │   │   └── database.module.ts
│   │   └── modules/           # 业务模块
│   │       ├── auth/          # 认证授权
│   │       │   ├── auth.module.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── dto/
│   │       │   │   ├── register.dto.ts
│   │       │   │   ├── login.dto.ts
│   │       │   │   └── refresh-token.dto.ts
│   │       │   └── strategies/
│   │       │       ├── jwt.strategy.ts
│   │       │       └── local.strategy.ts
│   │       ├── users/         # 用户管理
│   │       │   ├── users.module.ts
│   │       │   ├── users.service.ts
│   │       │   ├── users.controller.ts
│   │       │   ├── entities/
│   │       │   │   └── user.entity.ts
│   │       │   └── dto/
│   │       │       ├── create-user.dto.ts
│   │       │       └── update-user.dto.ts
│   │       ├── posts/         # 文章管理
│   │       │   ├── posts.module.ts
│   │       │   ├── posts.service.ts
│   │       │   ├── posts.controller.ts
│   │       │   ├── entities/
│   │       │   │   └── post.entity.ts
│   │       │   └── dto/
│   │       ├── categories/    # 分类管理
│   │       ├── tags/          # 标签管理
│   │       ├── comments/      # 评论管理
│   │       ├── media/         # 媒体管理
│   │       └── system/        # 系统管理
│   ├── test/                  # 测试文件
│   ├── uploads/               # 上传文件目录
│   ├── logs/                  # 日志目录
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── env.example            # 环境变量模板
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── web/                        # 前台网站 (Next.js)
│   ├── src/
│   │   ├── app/               # App Router 页面
│   │   ├── components/        # React 组件
│   │   ├── lib/               # 工具函数
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── store/             # 状态管理
│   │   └── types/             # TypeScript 类型
│   ├── public/                # 静态资源
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── admin/                      # 后台管理 (Next.js + Ant Design)
│   ├── src/
│   │   ├── app/               # App Router 页面
│   │   ├── components/        # React 组件
│   │   ├── lib/               # 工具函数
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── store/             # 状态管理
│   │   └── types/             # TypeScript 类型
│   ├── public/                # 静态资源
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── app/                        # 移动端应用 (Next.js PWA)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── packages/                   # 共享包（预留）
│   └── shared/                # 共享类型和工具
├── .editorconfig              # 编辑器配置
├── .eslintrc.js               # ESLint 配置
├── .gitignore                 # Git 忽略文件
├── .node-version              # Node 版本
├── .nvmrc                     # NVM 配置
├── .prettierrc                # Prettier 配置
├── .prettierignore            # Prettier 忽略文件
├── .commitlintrc.js           # Commitlint 配置
├── CHANGELOG.md               # 更新日志
├── CONTRIBUTING.md            # 贡献指南
├── docker-compose.yml         # Docker Compose 配置
├── LICENSE                    # 许可证
├── Makefile                   # Make 命令
├── package.json               # 根 package.json
├── pnpm-workspace.yaml        # pnpm workspace 配置
├── PROJECT_STRUCTURE.md       # 本文件
├── README.md                  # 项目说明
└── turbo.json                 # Turbo 配置
```

## 模块说明

### 后端模块

#### 认证授权 (auth)

- 用户注册、登录、登出
- JWT Token 认证
- Refresh Token 刷新
- 密码加密

#### 用户管理 (users)

- 用户 CRUD
- 用户角色管理（RBAC）
- 用户状态管理
- 最后登录记录

#### 文章管理 (posts)

- 文章 CRUD
- 文章状态（草稿、已发布、归档）
- 文章搜索
- 浏览量统计
- 点赞功能
- 精选和置顶

#### 分类管理 (categories)

- 分类 CRUD
- 分类排序
- 分类状态

#### 标签管理 (tags)

- 标签 CRUD
- 标签颜色
- 多对多关联

#### 评论管理 (comments)

- 评论 CRUD
- 多级评论（树形结构）
- 评论审核
- 评论点赞

#### 媒体管理 (media)

- 文件上传
- 图片压缩
- 文件类型管理
- 媒体库

#### 系统管理 (system)

- 系统信息
- 进程信息
- 健康检查

### 前端模块

#### Web (前台网站)

- 首页
- 文章列表
- 文章详情
- 分类页面
- 标签页面
- 搜索功能
- 用户中心

#### Admin (后台管理)

- 仪表盘
- 用户管理
- 文章管理
- 分类标签管理
- 评论管理
- 媒体管理
- 系统设置

#### App (移动端)

- PWA 支持
- 离线访问
- 推送通知
- 响应式设计

## 技术特性

### 后端特性

- ✅ DDD 分层架构
- ✅ 依赖注入
- ✅ 模块化设计
- ✅ TypeORM 数据库操作
- ✅ Redis 缓存
- ✅ JWT 认证
- ✅ RBAC 权限控制
- ✅ Swagger API 文档
- ✅ 全局异常处理
- ✅ 请求验证
- ✅ 日志系统
- ✅ 健康检查

### 前端特性

- ✅ Next.js App Router
- ✅ TypeScript 严格模式
- ✅ 服务端渲染（SSR）
- ✅ 静态生成（SSG）
- ✅ SWR 数据请求
- ✅ Zustand 状态管理
- ✅ TailwindCSS 样式
- ✅ 响应式设计

### 开发特性

- ✅ Monorepo 架构
- ✅ pnpm Workspace
- ✅ Turbo 构建加速
- ✅ Catalog 依赖管理
- ✅ ESLint + Prettier
- ✅ Husky + Commitlint
- ✅ TypeScript 类型检查
- ✅ 热更新（HMR）

### 部署特性

- ✅ Docker 容器化
- ✅ Docker Compose 编排
- ✅ Nginx 反向代理
- ✅ 数据库迁移
- ✅ 环境变量配置
- ✅ 生产环境优化

## 数据流

### 请求处理流程

```
客户端请求
    ↓
Nginx (反向代理)
    ↓
NestJS (入口)
    ↓
全局守卫 (认证 & 授权)
    ↓
路由控制器
    ↓
业务服务层
    ↓
数据访问层 (TypeORM)
    ↓
PostgreSQL 数据库
    ↓
响应拦截器 (格式化)
    ↓
客户端响应
```

### 缓存策略

```
请求 → 检查 Redis 缓存
         ↓
    有缓存 → 返回缓存数据
         ↓
    无缓存 → 查询数据库
         ↓
       存入缓存
         ↓
       返回数据
```

## 文件命名规范

### 后端

- 模块：`*.module.ts`
- 服务：`*.service.ts`
- 控制器：`*.controller.ts`
- 实体：`*.entity.ts`
- DTO：`*.dto.ts`
- 守卫：`*.guard.ts`
- 拦截器：`*.interceptor.ts`
- 装饰器：`*.decorator.ts`
- 测试：`*.spec.ts`

### 前端

- 页面：`page.tsx`
- 布局：`layout.tsx`
- 加载：`loading.tsx`
- 错误：`error.tsx`
- 组件：`ComponentName.tsx`
- Hooks：`use*.ts`
- 工具：`*.util.ts`
- 类型：`*.types.ts`

## 环境变量

### 后端 (service/.env)

```env
# 应用
NODE_ENV=development
PORT=3000

# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=fidoo_blog

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
```

### 前端

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 端口分配

- `3000` - 后端 API 服务
- `3001` - 前台网站
- `3002` - 后台管理
- `3003` - 移动端应用
- `5432` - PostgreSQL
- `6379` - Redis
- `80` - Nginx HTTP
- `443` - Nginx HTTPS

## 更多信息

- [快速开始](docs/QUICKSTART.md)
- [架构设计](docs/ARCHITECTURE.md)
- [API 文档](docs/API.md)
- [部署指南](docs/DEPLOYMENT.md)
- [贡献指南](CONTRIBUTING.md)
