# 数据库设置指南

## 快速初始化数据库

### 一键初始化（推荐）

```bash
# 1. 启动服务（Redis + PostgreSQL）
pnpm start:services

# 2. 初始化数据库（迁移 + 测试数据）
pnpm init:db
```

这会自动：
- ✅ 运行数据库迁移
- ✅ 生成测试数据

### 手动初始化

#### 步骤 1: 运行数据库迁移

```bash
# 在 service 目录下
cd service
pnpm migration:run
```

#### 步骤 2: 生成测试数据

**基础测试数据（推荐）:**
```bash
pnpm seed
```

这会生成：
- 5 个用户（admin, editor, zhangsan, lisi, wangwu）
- 6 个分类
- 20 个标签
- 8 篇文章
- 评论数据

**大量测试数据（性能测试用）:**
```bash
pnpm seed:large
```

这会生成：
- 150 个用户
- 1000 篇文章
- 5000+ 条评论
- 更多测试数据

## 测试账号

### 管理员账号
- **用户名**: `admin`
- **密码**: `123456`
- **角色**: 管理员

### 编辑账号
- **用户名**: `editor`
- **密码**: `123456`
- **角色**: 编辑

### 普通用户
- **用户名**: `zhangsan` / `lisi` / `wangwu`
- **密码**: `123456`
- **角色**: 用户

## 从根目录运行

你也可以从项目根目录运行：

```bash
# 运行迁移
pnpm service:migration:run

# 生成基础测试数据
pnpm service:seed

# 生成大量测试数据
pnpm service:seed:large
```

## 注意事项

⚠️ **警告**: 
- 种子脚本会**清空现有数据**！
- 请在生产环境使用前备份数据库
- 如果需要保留现有数据，请修改种子脚本

## 重置数据库

如果需要完全重置数据库：

```bash
# 1. 停止并删除容器
pnpm docker:dev:down

# 2. 删除数据卷（可选，会删除所有数据）
docker volume rm fidoo-blog_postgres_data_dev

# 3. 重新启动服务
pnpm start:services

# 4. 重新初始化
pnpm init:db
```

## 常见问题

### 迁移失败

**错误**: `relation "xxx" does not exist`

**解决方案**: 
1. 确保数据库已创建: `createdb fidoo_blog`
2. 检查环境变量配置是否正确

### 种子数据生成失败

**错误**: `duplicate key value violates unique constraint`

**解决方案**: 
1. 检查是否已有数据
2. 种子脚本会自动清空数据，如果失败可能是外键约束问题
3. 可以手动清空数据库后重新运行

### 连接数据库失败

**错误**: `ECONNREFUSED`

**解决方案**:
1. 确保 PostgreSQL 容器正在运行: `docker ps | grep postgres`
2. 检查端口是否被占用: `lsof -i :5432`
3. 检查环境变量配置

