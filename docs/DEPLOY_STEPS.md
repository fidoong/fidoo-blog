# 服务器部署步骤指南

连接服务器后，按照以下步骤部署项目。

## 📋 部署前准备

### 1. 更新系统

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y
```

### 2. 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 将当前用户添加到 docker 组（避免每次使用 sudo）
sudo usermod -aG docker $USER

# 重新登录或执行以下命令使组权限生效
newgrp docker

# 验证 Docker 安装
docker --version
```

### 3. 安装 Docker Compose

```bash
# 下载 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 添加执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 4. 配置防火墙

```bash
# 允许 SSH（22端口）
sudo ufw allow 22/tcp

# 允许 HTTP（80端口）
sudo ufw allow 80/tcp

# 启用防火墙
sudo ufw enable

# 查看防火墙状态
sudo ufw status
```

## 🚀 部署项目

### 1. 克隆项目

```bash
# 克隆项目
git clone https://github.com/fidoong/fidoo-blog.git

# 进入项目目录
cd fidoo-blog
```

### 2. 生成密钥文件

```bash
# 添加执行权限
chmod +x scripts/*.sh

# 生成密钥文件
./scripts/setup-secrets.sh
```

这会生成以下密钥文件：
- `secrets/postgres_password.txt`
- `secrets/db_password.txt`
- `secrets/redis_password.txt`
- `secrets/jwt_secret.txt`
- `secrets/jwt_refresh_secret.txt`

### 3. 配置环境变量（可选）

```bash
# 复制环境变量模板
cp service/env.example service/.env.production

# 编辑环境变量（如果需要自定义）
vim service/.env.production
```

**注意**：如果不编辑，会使用 `docker-compose.prod.yml` 中的默认值（已配置为 IP: 120.55.3.205）

### 4. 部署服务

```bash
# 使用部署脚本（推荐）
./scripts/deploy.sh production
```

部署脚本会自动：
- 检查环境
- 备份现有数据
- 构建 Docker 镜像
- 启动所有服务
- 运行数据库迁移
- 检查服务健康状态

### 5. 等待服务启动

```bash
# 等待服务启动（约 30-60 秒）
sleep 30

# 检查服务状态
docker-compose ps
```

### 6. 初始化数据库

```bash
# 运行数据库迁移
docker-compose exec service sh -c "cd /app && npm run migration:run"

# 如果需要，运行种子数据（可选）
# docker-compose exec service sh -c "cd /app && npm run seed"
```

## ✅ 验证部署

### 1. 检查服务状态

```bash
# 使用监控脚本
./scripts/monitor.sh status

# 或直接查看
docker-compose ps
```

### 2. 健康检查

```bash
# 使用监控脚本
./scripts/monitor.sh health

# 或手动检查
curl http://localhost/health
curl http://localhost/api/v1
```

### 3. 查看日志

```bash
# 查看所有服务日志
./scripts/monitor.sh logs

# 查看特定服务日志
docker-compose logs -f service
docker-compose logs -f nginx
```

### 4. 访问服务

部署成功后，通过以下地址访问：

- **前台网站**: http://120.55.3.205/
- **管理后台**: http://120.55.3.205/admin
- **API 服务**: http://120.55.3.205/api/v1
- **API 文档**: http://120.55.3.205/api/docs

## 🔧 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看资源使用
./scripts/monitor.sh stats
```

### 日志管理

```bash
# 查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f service
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f nginx

# 查看最近 100 行日志
docker-compose logs --tail=100 service
```

### 备份

```bash
# 完整备份
./scripts/backup.sh full

# 仅备份数据库
./scripts/backup.sh db

# 仅备份文件
./scripts/backup.sh files
```

## 🆘 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs service

# 检查配置
docker-compose config

# 检查端口占用
netstat -tulpn | grep -E "80|3005|5432|6379"
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose ps postgres

# 测试数据库连接
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# 检查环境变量
docker-compose exec service env | grep DB_
```

### 内存不足

```bash
# 检查内存使用
free -h
docker stats --no-stream

# 如果内存不足，可以：
# 1. 重启服务
docker-compose restart

# 2. 清理 Docker 资源
docker system prune -f
```

### 无法访问网站

```bash
# 检查 Nginx 状态
docker-compose ps nginx
docker-compose logs nginx

# 检查防火墙
sudo ufw status

# 测试本地访问
curl http://localhost/
curl http://localhost/api/v1
```

## 📝 部署后检查清单

- [ ] 所有服务正常运行
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] 可以通过 IP 访问网站
- [ ] API 可以正常访问
- [ ] 监控脚本正常工作
- [ ] 备份脚本正常工作

## 🔄 更新部署

如果需要更新代码：

```bash
# 进入项目目录
cd fidoo-blog

# 拉取最新代码
git pull origin main

# 重新部署
./scripts/deploy.sh production

# 运行新的数据库迁移（如果有）
docker-compose exec service sh -c "cd /app && npm run migration:run"
```

## 📚 相关文档

- [快速部署指南](./QUICK_DEPLOY.md)
- [IP 部署指南](./DEPLOY_WITH_IP.md)
- [企业级部署指南](./ENTERPRISE_DEPLOYMENT.md)

---

**提示**：如果遇到问题，先查看日志：`docker-compose logs -f`

