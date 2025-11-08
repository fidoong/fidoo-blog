# 项目配置说明

## 端口配置（已固定，无需每次修改）

### 前端 (Web)

- **固定端口**: `3000`
- 运行命令: `cd web && pnpm dev`
- 即使没有 `.env.local` 文件，端口也会固定为 3000

### 后端 (Service)

- **固定端口**: `3005` (避免与前端和其他服务冲突)
- 运行命令: `cd service && pnpm dev`
- 即使没有 `.env` 文件，端口也会固定为 3005（代码中已设置默认值）

> **注意**: 端口配置已经在代码中设置了默认值，即使没有环境变量文件，端口也是固定的。创建环境变量文件只是为了方便自定义配置。

## 环境变量配置（可选，用于自定义配置）

### 后端环境变量 (service/.env)

如果不存在 `service/.env` 文件，可以复制示例文件：

```bash
cd service
cp env.example .env
```

然后根据需要修改配置（端口默认为 3005，通常不需要修改）：

```env
# 应用配置
NODE_ENV=development
PORT=3005
API_PREFIX=api
API_VERSION=v1

# 数据库配置
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=fidoo_blog
DB_SYNCHRONIZE=true
DB_LOGGING=false

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRATION=30d

# 跨域配置
CORS_ORIGINS=http://localhost:3000

# 文件上传配置
UPLOAD_MAX_FILE_SIZE=10485760
UPLOAD_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp

# 日志配置
LOG_LEVEL=debug
LOG_FILE_PATH=logs

# 限流配置
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### 前端环境变量 (web/.env.local)

如果不存在 `web/.env.local` 文件，可以复制示例文件：

```bash
cd web
cp .env.example .env.local
```

或者手动创建，内容如下：

```env
NEXT_PUBLIC_API_URL=http://localhost:3005/api/v1
```

> **注意**: 即使没有 `.env.local` 文件，前端也会使用默认值 `http://localhost:3005/api/v1`，所以端口配置是固定的。

## API 路径说明

后端使用 NestJS 版本控制，完整 API 路径格式：

- 基础路径: `http://localhost:3005/api/v1`
- 示例: `http://localhost:3005/api/v1/posts`
- 示例: `http://localhost:3005/api/v1/categories`

## 启动步骤

1. **启动后端服务**

   ```bash
   cd service
   pnpm install
   # 确保 PostgreSQL 和 Redis 已启动
   pnpm dev
   ```

2. **启动前端服务**

   ```bash
   cd web
   pnpm install
   pnpm dev
   ```

3. **访问应用**
   - 前端: http://localhost:3000
   - 后端 API: http://localhost:3005/api/v1
   - API 文档: http://localhost:3005/api/docs

## 常见问题

### 404 错误

- 确保后端服务正在运行 (端口 3005)
- 检查前端 `.env.local` 中的 `NEXT_PUBLIC_API_URL` 配置（如果没有文件，使用默认值即可）
- 确认后端 `.env` 中的 `PORT` 配置为 3005（如果没有文件，使用默认值 3005）

### 端口冲突

- 如果 3000 端口被占用，可以修改 `web/package.json` 中的 dev 脚本，添加 `-p 3002`
- 如果 3005 端口被占用，可以：
  1. 修改 `service/.env` 中的 `PORT` 配置
  2. 或者修改 `service/src/config/app.config.ts` 中的默认值
  3. 同时更新前端 `.env.local` 中的 `NEXT_PUBLIC_API_URL`

### 端口配置说明

- **端口已经固定在代码中**，即使没有环境变量文件，也会使用默认端口
- 前端默认端口：3000
- 后端默认端口：3005
- 前端 API 地址默认：`http://localhost:3005/api/v1`
