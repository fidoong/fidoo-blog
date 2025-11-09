# 快速启动指南

## 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker Desktop (推荐) 或本地安装 Redis 和 PostgreSQL

## 快速开始

### 方法 1: 使用 Docker (推荐)

#### 步骤 1: 启动 Docker Desktop
```bash
# macOS: 打开 Docker Desktop 应用
open -a Docker

# 或使用命令行（如果已安装）
```

#### 步骤 2: 启动依赖服务
```bash
# 一键启动 Redis 和 PostgreSQL
pnpm start:services

# 或手动启动
pnpm docker:dev
```

#### 步骤 3: 启动开发服务器
```bash
# 启动所有项目
pnpm dev

# 或只启动特定项目
pnpm dev:service  # 后端服务
pnpm dev:admin    # 后台管理
pnpm dev:web      # 前台网站
```

### 方法 2: 本地安装服务

#### macOS (使用 Homebrew)

```bash
# 安装 Redis
brew install redis
brew services start redis

# 安装 PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# 创建数据库
createdb fidoo_blog
```

#### Linux

```bash
# 安装 Redis
sudo apt-get install redis-server
sudo systemctl start redis

# 安装 PostgreSQL
sudo apt-get install postgresql-16
sudo systemctl start postgresql

# 创建数据库
sudo -u postgres createdb fidoo_blog
```

## 检查服务状态

```bash
# 检查所有服务
pnpm check:services

# 单独检查
redis-cli ping    # 应该返回 PONG
pg_isready        # 应该返回成功
```

## 环境变量配置

在 `service` 目录下创建 `.env.local` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=fidoo_blog

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d
```

## 常见问题

### Docker daemon 未运行

**错误信息:**
```
Cannot connect to the Docker daemon
```

**解决方案:**
1. 打开 Docker Desktop 应用
2. 等待 Docker 完全启动（状态栏显示 "Docker Desktop is running"）
3. 重新运行命令

### 端口被占用

**检查端口占用:**
```bash
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :3005  # 后端服务
```

**停止占用端口的进程:**
```bash
pnpm clean:ports
```

### 服务连接失败

**错误信息:**
```
ECONNREFUSED
```

**解决方案:**
1. 检查服务是否运行: `pnpm check:services`
2. 启动服务: `pnpm start:services`
3. 检查环境变量配置是否正确

## 停止服务

```bash
# 停止 Docker 服务
pnpm docker:dev:down

# 停止本地服务 (macOS)
brew services stop redis
brew services stop postgresql@16
```

## 下一步

1. ✅ 启动依赖服务 (Redis + PostgreSQL)
2. ✅ 配置环境变量
3. ✅ 运行数据库迁移: `cd service && pnpm migration:run`
4. ✅ 启动开发服务器: `pnpm dev`

## 访问地址

- 前台网站: http://localhost:3000
- 后台管理: http://localhost:3001
- 后端 API: http://localhost:3005/api/v1
- API 文档: http://localhost:3005/api/v1/docs

