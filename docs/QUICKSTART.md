# 快速开始指南

## 5 分钟快速体验

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker 和 Docker Compose (可选，推荐)

### 方式一：使用自动化脚本（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/fidoo/fidoo-blog.git
cd fidoo-blog

# 2. 运行安装脚本
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. 启动开发环境
make dev
# 或
pnpm dev
```

### 方式二：手动安装

#### 1. 安装依赖

```bash
# 安装 pnpm
npm install -g pnpm

# 安装项目依赖
pnpm install
```

#### 2. 配置环境变量

```bash
# 复制环境变量模板
cp service/env.example service/.env

# 编辑环境变量（使用你喜欢的编辑器）
vim service/.env
# 或
code service/.env
```

最小化配置（使用默认值）：

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=fidoo_blog
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-dev-secret-key
```

#### 3. 启动数据库

**使用 Docker（推荐）：**

```bash
# 启动 PostgreSQL 和 Redis
docker-compose up -d postgres redis

# 查看服务状态
docker-compose ps
```

**或手动安装：**

- 安装 PostgreSQL 16
- 安装 Redis 7
- 创建数据库：`createdb fidoo_blog`

#### 4. 初始化数据库

```bash
cd service
pnpm migration:run
cd ..
```

#### 5. 启动服务

**选项 A - 同时启动所有服务：**

```bash
pnpm dev
```

**选项 B - 分别启动服务（在不同终端）：**

```bash
# 终端 1 - 后端 API
pnpm service:dev

# 终端 2 - 前台网站
pnpm web:dev

# 终端 3 - 后台管理
pnpm admin:dev
```

#### 6. 访问应用

- **API 文档**: http://localhost:3000/api/docs
- **API 健康检查**: http://localhost:3000/health
- **前台网站**: http://localhost:3001 (预留)
- **后台管理**: http://localhost:3002 (预留)

## 测试 API

### 使用 Swagger UI

1. 打开 http://localhost:3000/api/docs
2. 点击 "Authorize" 按钮
3. 注册账号或登录
4. 复制返回的 `accessToken`
5. 在 Authorize 对话框中输入 `Bearer {token}`
6. 开始测试 API

### 使用 curl

#### 1. 注册用户

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "nickname": "测试用户"
  }'
```

#### 2. 登录

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!"
  }'
```

保存返回的 `accessToken`。

#### 3. 创建文章

```bash
TOKEN="your-access-token-here"

curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "我的第一篇文章",
    "slug": "my-first-post",
    "summary": "这是一篇测试文章",
    "content": "# Hello World\n\n这是文章内容...",
    "status": "published"
  }'
```

#### 4. 获取文章列表

```bash
curl http://localhost:3000/api/v1/posts?page=1&limit=10
```

## 使用 Makefile

项目提供了 Makefile 快捷命令：

```bash
# 查看所有可用命令
make help

# 安装依赖
make install

# 启动开发环境
make dev

# 构建项目
make build

# 运行测试
make test

# 代码检查
make lint

# 启动 Docker 服务
make docker-up

# 停止 Docker 服务
make docker-down
```

## 常见问题

### 1. 端口被占用

如果端口被占用，可以修改 `.env` 文件中的端口配置：

```env
PORT=3100  # 修改为其他可用端口
```

### 2. 数据库连接失败

检查：

- Docker 服务是否运行：`docker-compose ps`
- 环境变量配置是否正确
- 数据库服务是否健康：`docker-compose logs postgres`

重启数据库：

```bash
docker-compose restart postgres
```

### 3. pnpm 安装失败

清除缓存并重新安装：

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 4. 数据库迁移失败

检查数据库连接后重试：

```bash
cd service
pnpm migration:revert  # 回滚（如果需要）
pnpm migration:run     # 重新运行
```

## 下一步

### 开发后端

1. 查看 [API 文档](./API.md)
2. 了解 [架构设计](./ARCHITECTURE.md)
3. 阅读 [NestJS 文档](https://docs.nestjs.com/)

### 开发前端

1. 查看 `web/README.md` - 前台网站
2. 查看 `admin/README.md` - 后台管理
3. 阅读 [Next.js 文档](https://nextjs.org/docs)

### 部署上线

查看 [部署指南](./DEPLOYMENT.md)

## 示例数据

运行种子数据脚本（开发环境）：

```bash
cd service
pnpm seed
```

这将创建：

- 1 个管理员账号（admin/Admin123!）
- 10 个测试用户
- 20 篇示例文章
- 5 个分类
- 10 个标签
- 50 条评论

## 开发工具推荐

### VSCode 扩展

项目已配置推荐扩展（`.vscode/extensions.json`）：

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### API 测试工具

- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://www.thunderclient.com/) (VSCode 扩展)

### 数据库管理工具

- [DBeaver](https://dbeaver.io/)
- [pgAdmin](https://www.pgadmin.org/)
- [TablePlus](https://tableplus.com/)

## 获取帮助

- 📖 查看 [完整文档](../docs)
- 💬 提交 [GitHub Issues](https://github.com/fidoo/fidoo-blog/issues)
- 📧 发送邮件到 support@fidoo.com

## 贡献代码

查看 [贡献指南](../CONTRIBUTING.md)

---

祝您开发愉快！ 🚀
