# 生产环境使用本地镜像构建指南

本文档说明如何在生产环境中使用本地镜像构建 Docker 镜像，避免从网络拉取。

## 配置说明

### 1. Docker Compose 配置

生产环境配置文件 `deploy/docker-compose.prod.yml` 已配置 `pull: false`：

```yaml
service:
  build:
    context: ..
    dockerfile: Dockerfile.service
    pull: false  # 不尝试从网络拉取基础镜像
```

所有构建服务（service、web、admin）都已配置为使用本地镜像。

### 2. 构建脚本

项目提供了两个构建脚本，都支持使用本地镜像：

#### 方法 1: 使用 build-docker.sh（推荐）

```bash
# 检查并构建（使用本地镜像）
./deploy/build-docker.sh

# 强制重新构建（不使用缓存）
./deploy/build-docker.sh --no-cache
```

此脚本会：
- ✅ 检查必需的本地镜像是否存在
- ✅ 使用 `--pull=false` 确保不拉取网络镜像
- ✅ 禁用 BuildKit 以避免尝试解析镜像元数据
- ✅ 构建所有服务镜像（service、web、admin）

#### 方法 2: 使用 build-docker-direct.sh

```bash
# 使用 --pull=false 确保不拉取镜像
./deploy/build-docker-direct.sh

# 强制重新构建
./deploy/build-docker-direct.sh --no-cache
```

#### 方法 3: 使用 Docker Compose

```bash
# 使用 docker-compose 构建（自动使用 pull: false 配置）
cd /opt/fidoo-blog
docker-compose -f deploy/docker-compose.prod.yml build
```

#### 方法 4: 直接使用 docker build

```bash
# 构建后端服务（禁用 BuildKit 并使用 --pull=false）
DOCKER_BUILDKIT=0 docker build --pull=false -f Dockerfile.service -t fidoo-blog-service:latest .

# 构建前台网站
DOCKER_BUILDKIT=0 docker build --pull=false -f Dockerfile.web -t fidoo-blog-web:latest .

# 构建后台管理
DOCKER_BUILDKIT=0 docker build --pull=false -f Dockerfile.admin -t fidoo-blog-admin:latest .
```

## 完整部署流程

### 步骤 1: 导入必需的镜像

在构建前，确保必需的镜像已导入到本地：

```bash
# 检查镜像是否存在
docker images | grep -E "node:20-alpine|postgres:14-alpine|redis:6-alpine"

# 如果不存在，导入镜像
cd /opt/fidoo-blog
./deploy/import-missing-images.sh
```

必需的镜像：
- `node:20-alpine` - Node.js 基础镜像（必需）
- `postgres:14-alpine` - PostgreSQL 数据库镜像（运行数据库时使用）
- `redis:6-alpine` - Redis 缓存镜像（运行缓存时使用）

### 步骤 2: 构建应用镜像

```bash
cd /opt/fidoo-blog

# 使用构建脚本（推荐）
./deploy/build-docker.sh

# 或使用 docker-compose
docker-compose -f deploy/docker-compose.prod.yml build
```

### 步骤 3: 启动服务

```bash
# 启动所有服务
docker-compose -f deploy/docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f deploy/docker-compose.prod.yml ps

# 查看日志
docker-compose -f deploy/docker-compose.prod.yml logs -f
```

### 步骤 4: 运行数据库迁移

```bash
# 等待服务启动后（约30秒）
docker-compose -f deploy/docker-compose.prod.yml exec service sh -c "cd /app/service && pnpm migration:run"
```

## 离线环境部署

### 在本地机器上（有网络）

1. **导出镜像**：
   ```bash
   ./deploy/export-images.sh
   ```

2. **上传镜像到服务器**：
   ```bash
   scp -r docker-images root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/
   ```

### 在服务器上（无网络）

1. **导入镜像**：
   ```bash
   cd /opt/fidoo-blog
   ./deploy/import-missing-images.sh
   ```

2. **构建应用镜像**：
   ```bash
   ./deploy/build-docker.sh
   ```

3. **启动服务**：
   ```bash
   docker-compose -f deploy/docker-compose.prod.yml up -d
   ```

## 验证配置

### 检查镜像是否存在

```bash
# 列出所有镜像
docker images

# 检查特定镜像
docker images node:20-alpine
docker images postgres:14-alpine
docker images redis:6-alpine
```

### 验证构建配置

```bash
# 检查 docker-compose 配置
grep -A 3 "pull: false" deploy/docker-compose.prod.yml
```

应该看到所有构建服务都配置了 `pull: false`。

## 故障排除

### 问题 1: 构建时仍然尝试拉取镜像

**错误信息**：
```
Error response from daemon: pull access denied for node:20-alpine
```

**解决方案**：
1. 确保 `docker-compose.prod.yml` 中配置了 `pull: false`
2. 使用构建脚本：`./deploy/build-docker.sh`（已自动检测版本并禁用 BuildKit）
3. 或使用 `DOCKER_BUILDKIT=0 docker build` 命令（不使用 --pull 参数）
4. 确保本地镜像已正确导入：`./deploy/import-missing-images.sh`

### 问题 2: 镜像不存在错误

**错误信息**：
```
Error: pull access denied for node:20-alpine, repository does not exist
```

**解决方案**：
```bash
# 先导入镜像
./deploy/import-missing-images.sh

# 验证镜像已导入
docker images node:20-alpine
```

### 问题 3: Docker Compose 版本问题

如果使用的是旧版本的 Docker Compose，`pull: false` 可能不被支持。

**解决方案**：
- 升级到 Docker Compose v2.0+
- 或使用 `docker build --pull=false` 直接构建

### 问题 4: 构建脚本权限问题

```bash
# 添加执行权限
chmod +x deploy/build-docker.sh
chmod +x deploy/build-docker-direct.sh
chmod +x deploy/import-missing-images.sh
```

## 注意事项

1. **镜像版本一致性**：确保本地镜像版本与 Dockerfile 中指定的版本一致
   - Dockerfile 中使用：`FROM node:20-alpine`
   - 本地镜像必须是：`node:20-alpine`

2. **镜像完整性**：确保导入的镜像文件完整，没有损坏

3. **构建缓存**：使用本地镜像时，Docker 会使用本地缓存，构建速度会更快

4. **离线环境**：此配置特别适合离线或网络受限的生产环境

5. **安全性**：使用本地镜像可以避免从公共仓库拉取镜像时的安全风险

## 相关文件

- `deploy/docker-compose.prod.yml` - 生产环境配置（已配置 `pull: false`）
- `deploy/build-docker.sh` - 构建脚本（使用 `--pull=false`）
- `deploy/build-docker-direct.sh` - 直接构建脚本（使用 `--pull=never`）
- `deploy/import-missing-images.sh` - 导入镜像脚本
- `deploy/export-images.sh` - 导出镜像脚本

## 快速参考

```bash
# 完整部署流程（离线环境）
cd /opt/fidoo-blog
./deploy/import-missing-images.sh    # 导入基础镜像
./deploy/build-docker.sh              # 构建应用镜像
docker-compose -f deploy/docker-compose.prod.yml up -d  # 启动服务
```

