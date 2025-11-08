# 数据库种子脚本

## 说明

此脚本用于在数据库中预制初始数据，包括用户、分类、标签、文章和评论等。

## 使用方法

### 1. 确保数据库已创建并配置

确保 `.env` 文件中的数据库配置正确：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=fidoo_blog
```

### 2. 运行种子脚本

```bash
npm run seed
```

或者使用 pnpm：

```bash
pnpm seed
```

## 预制数据内容

### 用户（5个）

- **admin** (管理员)
  - 用户名: `admin`
  - 密码: `123456`
  - 角色: 管理员
- **editor** (编辑)
  - 用户名: `editor`
  - 密码: `123456`
  - 角色: 编辑

- **zhangsan** (普通用户)
  - 用户名: `zhangsan`
  - 密码: `123456`
  - 角色: 用户

- **lisi** (普通用户)
  - 用户名: `lisi`
  - 密码: `123456`
  - 角色: 用户

- **wangwu** (普通用户)
  - 用户名: `wangwu`
  - 密码: `123456`
  - 角色: 用户

### 分类（6个）

- 前端开发
- 后端开发
- 移动开发
- 人工智能
- 开发工具
- 代码人生

### 标签（20个）

- JavaScript, TypeScript, React, Vue.js
- Node.js, NestJS, Python, Java, Go
- Docker, Kubernetes
- MySQL, PostgreSQL, Redis, MongoDB
- Git, GitHub, Linux
- 算法, 数据结构

### 文章（8篇）

- 涵盖前端、后端、工具等多个分类
- 包含不同的标签组合
- 包含浏览量、点赞数、评论数等统计数据
- 前3篇为精选文章，第1篇为置顶文章

### 评论（每篇文章3-5条）

- 随机分配给不同用户
- 状态为已审核通过

## 注意事项

⚠️ **警告**: 此脚本会清空现有数据！请在生产环境使用前备份数据库。

如果需要保留现有数据，可以修改 `run-seed.ts` 文件，注释掉清空数据的部分：

```typescript
// 注释掉这部分
// await commentRepository.delete({});
// await postRepository.delete({});
// ...
```

## 自定义数据

如果需要修改预制数据，请编辑 `src/database/seeds/run-seed.ts` 文件。
