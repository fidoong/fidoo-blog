# Fidoo Blog 技术架构分析

## 项目概述

Fidoo Blog 是一个企业级博客系统，采用 Monorepo 架构，使用 pnpm workspace 和 Turbo 进行管理。

## 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **UI 库**: 
  - 前台: Radix UI + Tailwind CSS + shadcn/ui
  - 后台: Ant Design 5 + Formily
- **状态管理**: Zustand
- **数据获取**: TanStack Query (React Query)
- **WebSocket**: Socket.io Client
- **构建工具**: Next.js (SWC)

### 后端
- **框架**: NestJS 10
- **数据库**: PostgreSQL (TypeORM)
- **缓存**: Redis (cache-manager)
- **消息队列**: Bull (基于 Redis)
- **认证**: Passport.js (JWT, Local, GitHub OAuth)
- **WebSocket**: Socket.io
- **API 文档**: Swagger
- **日志**: Winston
- **国际化**: nestjs-i18n

### 工具链
- **包管理**: pnpm 10.20.0
- **构建系统**: Turbo
- **代码规范**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **提交规范**: Commitlint

## 项目结构

```
fidoo-blog/
├── admin/              # 后台管理系统 (Next.js, 端口 3001)
├── web/                # 前台网站 (Next.js, 端口 3000)
├── service/            # 后端服务 (NestJS, 端口 3005)
├── packages/
│   └── shared/         # 共享类型和工具
├── scripts/            # 开发脚本
├── docker-compose.yml  # Docker 编排配置
└── turbo.json          # Turbo 配置
```

## 核心功能模块

### 后端模块 (service/src/modules/)
- **auth**: 认证授权（JWT、OAuth、设备管理）
- **users**: 用户管理
- **posts**: 文章管理
- **categories**: 分类管理
- **tags**: 标签管理
- **comments**: 评论系统
- **media**: 媒体文件管理
- **notifications**: 通知系统
- **favorites**: 收藏功能
- **likes**: 点赞功能
- **follows**: 关注功能
- **menus**: 菜单管理
- **permissions**: 权限管理
- **roles**: 角色管理
- **dictionaries**: 字典管理
- **audit-logs**: 审计日志
- **websocket**: WebSocket 实时通信

### 公共模块 (service/src/common/)
- **audit**: 审计功能
- **batch**: 批量操作
- **cache**: 缓存管理
- **decorators**: 装饰器
- **dto**: 数据传输对象
- **encryption**: 加密工具
- **exceptions**: 异常处理
- **filters**: 异常过滤器
- **guards**: 守卫
- **interceptors**: 拦截器
- **lock**: 分布式锁
- **logger**: 日志系统
- **middleware**: 中间件
- **pipes**: 管道
- **retry**: 重试机制
- **throttle**: 限流
- **tracing**: 链路追踪
- **transformers**: 数据转换
- **validators**: 验证器

## 数据库设计

### 核心实体
- User (用户)
- Post (文章)
- Category (分类)
- Tag (标签)
- Comment (评论)
- Media (媒体文件)
- Notification (通知)
- Menu (菜单)
- Permission (权限)
- Role (角色)
- Dictionary (字典)
- AuditLog (审计日志)

### 关系实体
- UserRole (用户角色)
- RolePermission (角色权限)
- RoleMenu (角色菜单)
- Follow (关注)
- Like (点赞)
- Favorite (收藏)

## API 设计

### RESTful API
- 基础路径: `/api/v1`
- 认证: JWT Bearer Token
- 版本控制: URL 路径版本化
- 分页: 统一分页参数
- 过滤: 查询参数过滤
- 排序: 查询参数排序

### WebSocket
- 实时通知
- 消息推送
- 在线状态

## 安全特性

1. **认证授权**
   - JWT Token 认证
   - OAuth 2.0 (GitHub)
   - 角色权限控制 (RBAC)
   - 设备管理

2. **防护机制**
   - 限流 (Throttler)
   - CORS 配置
   - 安全头设置
   - SQL 注入防护 (TypeORM)
   - XSS 防护

3. **审计日志**
   - 操作记录
   - 异常追踪
   - 性能监控

## 性能优化

### 前端优化
- Next.js 静态生成 (SSG)
- 图片优化 (Next.js Image)
- 代码分割
- 懒加载
- 缓存策略

### 后端优化
- Redis 缓存
- 数据库连接池
- 批量操作
- 异步处理 (Bull Queue)
- 日志轮转

## 开发工作流

### 1. 初始化项目
```bash
make setup
# 或
pnpm setup
```

### 2. 启动开发环境
```bash
# 启动数据库和 Redis
make docker-up-dev

# 启动所有服务
make dev
# 或
pnpm dev
```

### 3. 代码开发
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化

### 4. 代码提交
```bash
# 格式化代码
make format

# 类型检查
make typecheck

# 运行测试
make test
```

### 5. 构建和部署
```bash
# 构建项目
make build

# Docker 部署
make docker-build
make docker-up
```

## 环境配置

### 开发环境
- Node.js >= 18.0.0
- pnpm >= 10.0.0
- PostgreSQL 15
- Redis 7

### 生产环境
- Docker & Docker Compose
- 环境变量配置
- 日志管理
- 监控告警

## 部署架构

### Docker 容器
- `postgres`: PostgreSQL 数据库
- `redis`: Redis 缓存
- `service`: 后端服务
- `web`: 前台网站
- `admin`: 后台管理

### 网络
- 内部网络: `fidoo-blog-network`
- 服务间通信: 容器名称

### 数据持久化
- PostgreSQL 数据卷
- Redis 数据卷
- 上传文件目录

## 监控和日志

### 日志
- 应用日志: Winston
- 访问日志: Express 中间件
- 错误日志: 异常过滤器
- 审计日志: 数据库存储

### 健康检查
- `/health`: 服务健康检查
- Docker 健康检查配置

## 扩展性

### 水平扩展
- 无状态服务设计
- 共享 Redis 缓存
- 数据库连接池

### 垂直扩展
- 代码优化
- 缓存策略
- 数据库索引

## 未来规划

1. **功能增强**
   - 全文搜索 (Elasticsearch)
   - 文件存储 (OSS/S3)
   - CDN 加速
   - 邮件服务

2. **性能优化**
   - GraphQL API
   - 服务端渲染优化
   - 边缘计算

3. **DevOps**
   - CI/CD 流水线
   - 自动化测试
   - 性能监控
   - 错误追踪

