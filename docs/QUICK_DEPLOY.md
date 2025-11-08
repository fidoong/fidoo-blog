# 快速部署指南 - 阿里云服务器

本文档提供在阿里云服务器上快速部署的简化步骤。

## 🚀 快速开始

### 1. 准备服务器

- 操作系统: Ubuntu 22.04 LTS
- 配置: 2核4G 或更高
- 开放端口: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### 2. 一键安装环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 重新登录以应用 Docker 组权限
exit
```

### 3. 克隆项目

```bash
git clone https://github.com/fidoo/fidoo-blog.git
cd fidoo-blog
```

### 4. 生成密钥

```bash
chmod +x scripts/*.sh
./scripts/setup-secrets.sh
```

### 5. 配置域名（可选）

编辑 `docker/nginx/nginx.prod.conf`，将所有 `yourdomain.com` 替换为你的域名。

### 6. 配置 SSL 证书

#### 方式一：Let's Encrypt（免费）

```bash
# 安装 Certbot
sudo apt install certbot -y

# 申请证书（替换为你的域名）
sudo certbot certonly --standalone -d api.yourdomain.com -d www.yourdomain.com -d yourdomain.com -d admin.yourdomain.com

# 复制证书
sudo mkdir -p docker/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/certificate.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/private.key
sudo cp /etc/letsencrypt/live/yourdomain.com/chain.pem docker/nginx/ssl/ca.crt
sudo chown -R $USER:$USER docker/nginx/ssl
```

#### 方式二：使用 HTTP（仅测试）

如果暂时不需要 HTTPS，可以修改 `docker-compose.yml`，使用基础的 `nginx.conf` 配置。

### 7. 配置环境变量

```bash
# 复制环境变量模板
cp service/env.example service/.env.production

# 编辑环境变量（替换域名）
vim service/.env.production
```

关键配置：

```env
NODE_ENV=production
CORS_ORIGINS=https://www.yourdomain.com,https://admin.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

### 8. 部署

```bash
# 使用部署脚本（推荐）
./scripts/deploy.sh production

# 或手动部署
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 9. 初始化数据库

```bash
# 等待服务启动
sleep 10

# 运行数据库迁移
docker-compose exec service sh -c "cd /app && npm run migration:run"
```

### 10. 验证部署

```bash
# 检查服务状态
./scripts/monitor.sh status

# 健康检查
./scripts/monitor.sh health

# 访问网站
# https://www.yourdomain.com - 前台网站
# https://admin.yourdomain.com - 管理后台
# https://api.yourdomain.com/api/docs - API 文档
```

## 📝 常用命令

```bash
# 查看服务状态
./scripts/monitor.sh status

# 查看日志
./scripts/monitor.sh logs
./scripts/monitor.sh logs service  # 查看特定服务

# 备份
./scripts/backup.sh full

# 重启服务
docker-compose restart

# 更新部署
git pull
./scripts/deploy.sh production
```

## 🔧 故障排查

### 服务无法启动

```bash
# 查看日志
docker-compose logs service
docker-compose logs postgres

# 检查配置
docker-compose config
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose ps postgres

# 测试连接
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

## 📚 更多信息

详细的企业级部署方案请参考：[企业级部署指南](./ENTERPRISE_DEPLOYMENT.md)

