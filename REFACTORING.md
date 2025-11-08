# 代码重构文档

## 重构目标

1. **合理的目录结构** - 清晰的分层架构，易于维护和扩展
2. **合理的封装** - 高内聚、低耦合的模块设计
3. **高复用性** - 可复用的组件、工具和服务
4. **高扩展性** - 易于添加新功能和模块
5. **灵活的设计** - 支持多种业务场景
6. **优秀的后端解决方案** - 企业级架构模式

## 已完成的重构

### 1. 共享包结构 (`packages/shared`)

创建了共享包，包含：

- **类型定义** (`src/types/`) - 前后端通用的类型定义
- **常量定义** (`src/constants/`) - 共享常量
- **工具函数** (`src/utils/`) - 通用工具函数

### 2. 后端架构重构

#### Repository 模式

- 创建了 `PostRepository` 作为示例
- 封装了数据访问逻辑
- 提供了专门的查询方法（`findPublished`, `findBySlug`, `findByCategory` 等）

#### 领域服务层

- 创建了 `PostDomainService` 作为示例
- 负责领域业务逻辑
- 包含实体创建、更新、验证等方法

#### 服务层优化

- `PostsService` 现在使用 Repository 和 DomainService
- 职责更加清晰：Service 负责协调，Repository 负责数据访问，DomainService 负责业务逻辑

### 3. 模块结构优化

```
service/src/modules/posts/
├── entities/          # 实体定义
├── dto/              # 数据传输对象
├── repositories/     # Repository 层（数据访问）
│   └── post.repository.ts
├── domain/           # 领域服务层（业务逻辑）
│   └── post.domain.service.ts
├── posts.service.ts  # 应用服务层（协调）
├── posts.controller.ts
└── posts.module.ts
```

## 待完成的重构

### 1. 前端架构重构

#### Feature-Sliced Design (FSD) 架构

```
web/src/
├── app/              # Next.js App Router
├── features/         # 功能模块（业务功能）
│   ├── auth/
│   ├── posts/
│   ├── comments/
│   └── ...
├── entities/          # 实体（数据模型）
│   ├── post/
│   ├── user/
│   └── ...
├── shared/           # 共享资源
│   ├── api/          # API 客户端
│   ├── ui/           # UI 组件库
│   ├── lib/          # 工具函数
│   ├── hooks/        # 自定义 Hooks
│   └── store/        # 状态管理
└── widgets/          # 复合组件（组合多个 features）
```

#### 组件分类

- **UI 组件** (`shared/ui/`) - 基础 UI 组件，无业务逻辑
- **Features** (`features/`) - 业务功能模块
- **Widgets** (`widgets/`) - 复合组件，组合多个 features
- **Entities** (`entities/`) - 数据模型和相关的业务逻辑

### 2. API 客户端优化

- 统一错误处理
- 请求/响应拦截器优化
- 类型安全的 API 调用
- 自动重试机制
- 请求去重

### 3. 状态管理优化

- 统一 store 结构
- 引入中间件（日志、持久化等）
- 优化状态更新逻辑

### 4. 组件库优化

- 统一 UI 组件设计系统
- 提高组件复用性
- 优化组件 API

### 6. 配置管理优化

- 统一配置结构
- 环境变量管理
- 配置验证

## 重构原则

1. **单一职责原则** - 每个模块、类、函数只负责一个功能
2. **开闭原则** - 对扩展开放，对修改关闭
3. **依赖倒置原则** - 依赖抽象而非具体实现
4. **接口隔离原则** - 使用多个专门的接口，而不是一个总接口
5. **DRY 原则** - 不要重复自己
6. **KISS 原则** - 保持简单

## 最佳实践

### 后端

- 使用 Repository 模式封装数据访问
- 使用领域服务处理业务逻辑
- 使用应用服务协调各个层
- 统一异常处理
- 统一响应格式

### 前端

- 组件化开发
- 关注点分离
- 类型安全
- 性能优化（懒加载、代码分割）
- 可访问性（a11y）

## 参考资源

- [NestJS 最佳实践](https://docs.nestjs.com/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
