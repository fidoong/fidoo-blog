# Docker 镜像传输指南

如果服务器无法直接拉取 Docker 镜像，可以在本地导出镜像后传输到服务器。

## 方法一：使用脚本（推荐）

### 1. 在本地机器上导出镜像

```bash
cd /path/to/fidoo-blog

# 运行导出脚本
./deploy/export-images.sh
```

脚本会自动：
- 检查本地是否有需要的镜像
- 如果没有，尝试拉取
- 导出所有镜像到 `./docker-images/` 目录

### 2. 上传镜像到服务器

使用 `scp` 或 `rsync` 上传：

```bash
# 使用 scp
scp -r docker-images root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/

# 或使用 rsync（推荐，支持断点续传）
rsync -avz --progress docker-images/ root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/docker-images/
```

### 3. 在服务器上导入镜像

```bash
# SSH 登录服务器
ssh root@YOUR_SERVER_IP

# 进入项目目录
cd /opt/fidoo-blog

# 拉取最新代码（包含导入脚本）
git pull

# 运行导入脚本
./deploy/import-images.sh
```

## 方法二：手动操作

### 1. 在本地导出单个镜像

```bash
# 导出 node:20-alpine
docker save node:20-alpine | gzip > node-20-alpine.tar.gz

# 导出 postgres:14-alpine
docker save postgres:14-alpine | gzip > postgres-14-alpine.tar.gz

# 导出 redis:6-alpine
docker save redis:6-alpine | gzip > redis-6-alpine.tar.gz
```

### 2. 上传到服务器

```bash
scp *.tar.gz root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/docker-images/
```

### 3. 在服务器上导入

```bash
cd /opt/fidoo-blog/deploy/docker-images

# 导入镜像
gunzip -c node-20-alpine.tar.gz | docker load
gunzip -c postgres-14-alpine.tar.gz | docker load
gunzip -c redis-6-alpine.tar.gz | docker load

# 或者使用 docker load 直接导入（如果文件未压缩）
docker load < node-20-alpine.tar
```

## 需要的镜像列表

根据项目配置，需要以下镜像：

- `node:20-alpine` 或 `node:20`（用于构建和运行应用）
- `postgres:14-alpine`（数据库）
- `redis:6-alpine`（缓存）

## 验证导入

```bash
# 查看已导入的镜像
docker images | grep -E "node|postgres|redis"

# 测试镜像
docker run --rm node:20-alpine node --version
```

## 更新 Dockerfile（如果需要）

如果导入的镜像标签与 Dockerfile 中的不一致，需要更新：

```bash
# 例如，如果导入的是 node:latest，但 Dockerfile 使用的是 node:20-alpine
sed -i 's|node:20-alpine|node:latest|g' Dockerfile.service Dockerfile.web Dockerfile.admin
```

## 注意事项

1. **镜像体积**：Alpine 版本镜像较小（~50-100MB），完整版本较大（~300-500MB）
2. **传输时间**：根据网络速度，传输可能需要一些时间
3. **存储空间**：确保服务器有足够的磁盘空间
4. **版本兼容**：确保导入的 Node.js 版本 >= 18.12（pnpm@10.20.0 的要求）

## 完整流程示例

```bash
# === 本地机器 ===

# 1. 导出镜像
cd /path/to/fidoo-blog
./deploy/export-images.sh

# 2. 上传到服务器
rsync -avz --progress docker-images/ root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/docker-images/

# === 服务器 ===

# 3. 导入镜像
cd /opt/fidoo-blog
./deploy/import-images.sh

# 4. 构建和启动
docker-compose -f deploy/docker-compose.prod.yml build
docker-compose -f deploy/docker-compose.prod.yml up -d
```

