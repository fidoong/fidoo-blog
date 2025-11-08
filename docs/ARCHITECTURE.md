# 系统架构设计文档

## 1. 整体架构

### 1.1 技术栈

**后端**

- NestJS 10.x - 企业级 Node.js 框架
- TypeScript 5.x - 类型安全
- PostgreSQL 16.x - 主数据库
- Redis 7.x - 缓存和会话
- TypeORM - ORM 框架
- JWT + Passport - 认证授权
- Bull - 任务队列
- Winston - 日志系统

**前端**

- Next.js 14.x - React 框架
- React 18.x - UI 库
- TypeScript 5.x - 类型安全
- Ant Design 5.x - UI 组件库（后台）
- TailwindCSS - CSS 框架
- SWR - 数据请求
- Zustand - 状态管理

**基础设施**

- Docker - 容器化
- Docker Compose - 容器编排
- Nginx - 反向代理
- pnpm - 包管理器
- Turbo - Monorepo 构建工具

### 1.2 Monorepo 架构

```
fidoo-blog/
├── service/          # 后端服务
├── web/             # 前台网站
├── admin/           # 后台管理
├── app/             # 移动端应用
├── packages/        # 共享包
└── docker/          # Docker 配置
```

## 2. 后端架构

### 2.1 分层架构

采用 DDD (领域驱动设计) 分层架构：

```
service/src/
├── main.ts                 # 应用入口
├── app.module.ts          # 根模块
├── config/                # 配置层
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── jwt.config.ts
├── common/                # 公共层
│   ├── decorators/       # 装饰器
│   ├── filters/          # 异常过滤器
│   ├── guards/           # 守卫
│   ├── interceptors/     # 拦截器
│   └── logger/           # 日志服务
├── database/             # 数据库层
│   ├── base.entity.ts    # 基础实体
│   └── database.module.ts
└── modules/              # 业务模块层
    ├── auth/            # 认证授权
    ├── users/           # 用户管理
    ├── posts/           # 文章管理
    ├── categories/      # 分类管理
    ├── tags/            # 标签管理
    ├── comments/        # 评论管理
    ├── media/           # 媒体管理
    └── system/          # 系统管理
```

### 2.2 模块设计

每个业务模块采用标准结构：

```
module/
├── entities/          # 实体定义
├── dto/              # 数据传输对象
├── module.ts         # 模块定义
├── service.ts        # 业务逻辑
└── controller.ts     # 路由控制器
```

### 2.3 数据库设计

**核心实体关系**

```
User (用户)
  ├── 1:N → Post (文章)
  └── 1:N → Comment (评论)

Post (文章)
  ├── N:1 → User (作者)
  ├── N:1 → Category (分类)
  ├── N:N → Tag (标签)
  └── 1:N → Comment (评论)

Comment (评论)
  ├── N:1 → User (用户)
  ├── N:1 → Post (文章)
  └── 树形结构 (父子评论)
```

## 3. 安全设计

### 3.1 认证授权

- JWT Token 认证
- Refresh Token 刷新机制
- RBAC 角色权限控制
- 密码 bcrypt 加密

### 3.2 安全防护

- SQL 注入防护 (TypeORM 参数化查询)
- XSS 防护 (输入验证和转义)
- CSRF 防护
- 请求频率限制 (Throttler)
- 文件上传验证

## 4. 性能优化

### 4.1 缓存策略

- Redis 缓存热点数据
- 文章详情页缓存 (5分钟)
- 分类标签列表缓存
- 查询结果缓存

### 4.2 数据库优化

- 索引优化 (username, email, slug 等)
- 分页查询
- 关联查询优化
- 连接池配置 (max: 100, min: 10)

### 4.3 其他优化

- 图片压缩和尺寸调整 (Sharp)
- Gzip 压缩
- CDN 加速
- 懒加载

## 5. 可观测性

### 5.1 日志系统

- Winston 结构化日志
- 日志分级 (error, warn, info, debug)
- 日志文件轮转
- 错误堆栈追踪

### 5.2 监控指标

- 系统资源监控 (CPU, 内存)
- 进程信息监控
- API 响应时间
- 错误率统计

### 5.3 健康检查

- 应用健康检查 `/health`
- 数据库连接检查
- Redis 连接检查
- Docker 健康检查

## 6. 部署架构

### 6.1 容器化部署

```
                  ┌─────────┐
                  │  Nginx  │
                  │ (反向代理) │
                  └─────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼───┐    ┌────▼───┐    ┌────▼───┐
   │  Web   │    │ Admin  │    │  API   │
   │ :3001  │    │ :3002  │    │ :3000  │
   └────────┘    └────────┘    └───┬────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                    ┌────▼─────┐         ┌────▼────┐
                    │PostgreSQL│         │  Redis  │
                    │  :5432   │         │  :6379  │
                    └──────────┘         └─────────┘
```

### 6.2 环境配置

- Development (开发环境)
- Staging (预发布环境)
- Production (生产环境)

### 6.3 CI/CD

- Git 提交规范检查
- 代码质量检查 (ESLint)
- 自动化测试
- Docker 镜像构建
- 自动化部署

## 7. 扩展性设计

### 7.1 水平扩展

- 无状态 API 设计
- Session 存储在 Redis
- 文件存储支持对象存储
- 数据库读写分离

### 7.2 功能扩展

- 插件化架构
- 模块解耦
- 依赖注入
- 事件驱动

## 8. 最佳实践

### 8.1 代码规范

- TypeScript 严格模式
- ESLint + Prettier
- Git Commit 规范
- Code Review

### 8.2 测试策略

- 单元测试 (Jest)
- 集成测试
- E2E 测试
- 测试覆盖率 > 80%

### 8.3 文档规范

- API 文档 (Swagger)
- 代码注释
- 架构文档
- 部署文档
