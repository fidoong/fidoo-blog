# 解决 Segmentation fault 错误

如果遇到 `Segmentation fault` 错误，说明 docker-compose 程序崩溃了。

## 🚀 快速解决方案

### 方法一：使用 docker compose（推荐）

Docker 新版本内置了 `docker compose` 命令，无需单独安装：

```bash
# 1. 测试 docker compose
docker compose version

# 2. 如果可用，拉取更新后的脚本
cd ~/fidoo-blog
git pull

# 3. 继续部署
./scripts/deploy.sh production
```

### 方法二：手动使用 docker compose 部署

如果脚本还是有问题，可以手动执行：

```bash
cd ~/fidoo-blog

# 构建镜像
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# 启动服务
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 等待服务启动
sleep 30

# 运行数据库迁移
docker compose exec service sh -c "cd /app && npm run migration:run"

# 检查状态
docker compose ps
```

### 方法三：重新安装 docker-compose

如果必须使用 docker-compose：

```bash
# 删除旧文件
sudo rm -f /usr/local/bin/docker-compose

# 重新下载安装
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 设置权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version

# 继续部署
cd ~/fidoo-blog
./scripts/deploy.sh production
```

## 🔍 检查系统资源

Segmentation fault 也可能是资源不足导致的：

```bash
# 检查内存
free -h

# 检查磁盘空间
df -h

# 检查 Docker 资源
docker system df
```

如果资源不足，可以：
- 清理 Docker 资源：`docker system prune -f`
- 重启 Docker：`sudo systemctl restart docker`

## ✅ 推荐操作

**直接使用 `docker compose`**（最简单）：

```bash
# 测试
docker compose version

# 如果可用，手动部署
cd ~/fidoo-blog
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

**最快方法**：执行 `docker compose version`，如果可用，直接使用 `docker compose` 命令手动部署。

