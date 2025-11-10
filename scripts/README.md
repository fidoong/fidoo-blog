# Fidoo Blog 脚本使用说明

本目录包含项目开发、构建、部署相关的脚本文件。

## 脚本列表

### 1. setup.sh - 项目初始化脚本

首次克隆项目后，运行此脚本进行初始化。

```bash
./scripts/setup.sh
# 或
make setup
# 或
pnpm setup
```

**功能：**
- 检查系统依赖（Node.js、pnpm）
- 安装项目依赖
- 设置 Git Hooks
- 创建环境变量示例文件
- 构建共享包

### 2. dev.sh - 开发环境启动脚本

启动开发环境，支持启动单个或多个服务。

```bash
# 启动所有服务
./scripts/dev.sh all
# 或
make dev

# 仅启动后端服务
./scripts/dev.sh service
# 或
make dev-service

# 仅启动前台网站
./scripts/dev.sh web
# 或
make dev-web

# 仅启动后台管理
./scripts/dev.sh admin
# 或
make dev-admin
```

**功能：**
- 检查依赖和环境变量
- 自动安装依赖（如果未安装）
- 启动开发服务器
- 显示服务访问地址

### 3. format.sh - 代码格式化脚本

格式化代码或检查代码格式。

```bash
# 格式化代码
./scripts/format.sh fix
# 或
make format
# 或
pnpm format

# 检查代码格式（不修改）
./scripts/format.sh check
# 或
make format-check
# 或
pnpm format:check
```

**功能：**
- 使用 Prettier 格式化代码
- 运行 ESLint 自动修复
- 检查代码格式是否符合规范

### 4. build.sh - 构建脚本

构建项目，支持构建单个或多个模块。

```bash
# 构建所有项目
./scripts/build.sh all
# 或
make build

# 构建单个模块
./scripts/build.sh service
./scripts/build.sh web
./scripts/build.sh admin
./scripts/build.sh shared

# 清理后构建
./scripts/build.sh all clean
```

**功能：**
- 按依赖顺序构建（先构建 shared，再构建其他）
- 支持清理旧构建产物
- 显示构建结果

### 5. release.sh - 发布脚本

运行完整的发布流程，包括测试、类型检查、构建和创建 Git 标签。

```bash
# 发布（自动版本号）
./scripts/release.sh
# 或
make release

# 指定版本号
./scripts/release.sh 1.0.0
```

**功能：**
- 检查 Git 状态
- 运行代码格式检查
- 运行类型检查
- 运行测试
- 构建项目
- 创建 Git 标签（如果指定版本号）

## 使用 Makefile

项目提供了 Makefile，可以使用 `make` 命令快速执行常用操作：

```bash
# 查看所有可用命令
make help

# 常用命令
make setup          # 初始化项目
make dev            # 启动开发环境
make build          # 构建项目
make format         # 格式化代码
make test           # 运行测试
make docker-up      # 启动 Docker 服务
```

## 使用 pnpm 脚本

项目根目录的 `package.json` 中也定义了所有脚本：

```bash
# 开发
pnpm dev              # 启动所有服务
pnpm dev:service      # 仅启动后端
pnpm dev:web          # 仅启动前台
pnpm dev:admin        # 仅启动后台

# 构建
pnpm build            # 构建所有
pnpm build:service    # 构建后端
pnpm build:web        # 构建前台
pnpm build:admin      # 构建后台

# 代码质量
pnpm lint             # 代码检查
pnpm format           # 格式化代码
pnpm typecheck        # 类型检查

# Docker
pnpm docker:up        # 启动 Docker
pnpm docker:down      # 停止 Docker
pnpm docker:build     # 构建镜像
```

## Docker 部署

### 开发环境（仅数据库和 Redis）

```bash
# 启动开发环境 Docker 服务
make docker-up-dev
# 或
docker-compose -f docker-compose.dev.yml up -d

# 停止
make docker-down-dev
```

### 生产环境（完整服务）

```bash
# 构建并启动所有服务
make docker-build
make docker-up

# 查看日志
make docker-logs
make docker-logs-service  # 仅后端日志
make docker-logs-web      # 仅前台日志
make docker-logs-admin    # 仅后台日志

# 停止服务
make docker-down
```

## 环境变量配置

### 后端服务 (service/.env)

```env
# 应用配置
NODE_ENV=development
PORT=3005

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
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## 注意事项

1. **首次使用**：运行 `make setup` 初始化项目
2. **开发环境**：使用 `make docker-up-dev` 启动数据库和 Redis
3. **代码格式**：提交前运行 `make format` 格式化代码
4. **构建顺序**：shared 包必须先构建，其他项目依赖它
5. **Docker 镜像**：生产环境需要先构建镜像再启动

## 故障排查

### 端口被占用

```bash
# 检查端口占用
lsof -i :3000  # 前台
lsof -i :3001  # 后台
lsof -i :3005  # 后端
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### Docker 容器问题

```bash
# 查看容器状态
make docker-ps

# 查看日志
make docker-logs

# 重启服务
make docker-restart
```

### 依赖问题

```bash
# 清理并重新安装
make clean-all
pnpm install
```

