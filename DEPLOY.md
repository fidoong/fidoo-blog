# Fidoo Blog 阿里云 ECS 部署指南

本文档介绍如何在阿里云 ECS 实例上部署 Fidoo Blog 项目。

## 部署方式

项目支持两种部署方式：
1. **Docker Compose 部署**（推荐）- 简单快速，适合单机部署
2. **PM2 部署** - 更灵活，适合需要更多控制的场景

## 前置要求

### 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **CPU**: 2 核以上
- **内存**: 4GB 以上
- **磁盘**: 20GB 以上

### 软件要求
- Docker 20.10+
- Docker Compose 2.0+
- Git
- 或 Node.js 18+ + pnpm 10+（PM2 部署方式）

## 方式一：Docker Compose 部署（推荐）

### 1. 准备服务器

#### 1.1 连接到服务器
```bash
ssh root@your-server-ip
```

#### 1.2 安装 Docker 和 Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

#### 1.3 配置防火墙
```bash
# 开放必要端口
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Web (可选，如果不用 Nginx)
ufw allow 3001/tcp  # Admin (可选，如果不用 Nginx)
ufw allow 3005/tcp  # Service (可选，如果不用 Nginx)
ufw enable
```

### 2. 部署项目

#### 2.1 克隆项目
```bash
cd /opt
git clone https://github.com/your-username/fidoo-blog.git
cd fidoo-blog
```

#### 2.2 配置环境变量

创建生产环境配置文件：
```bash
# 复制环境变量模板
cp service/.env.example service/.env.production

# 编辑环境变量
vim service/.env.production
```

关键配置项：
```env
NODE_ENV=production
PORT=3005
APP_URL=https://your-domain.com

# 数据库配置（使用 Docker 中的 postgres）
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-strong-password
DB_DATABASE=fidoo_blog
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Redis 配置（使用 Docker 中的 redis）
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# JWT 密钥（必须修改）
JWT_SECRET=your-very-strong-secret-key-change-this
JWT_EXPIRES_IN=7d

# OAuth 配置（可选）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### 2.3 修改 Docker Compose 配置

编辑 `docker-compose.yml`，更新环境变量和密码：
```bash
vim docker-compose.yml
```

#### 2.4 构建和启动
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

#### 2.5 运行数据库迁移
```bash
# 进入后端服务容器
docker-compose exec service sh

# 运行迁移
cd /app/service
pnpm migration:run

# 运行种子数据（可选）
pnpm seed

# 退出容器
exit
```

### 3. 配置 Nginx 反向代理（推荐）

#### 3.1 安装 Nginx
```bash
# Ubuntu/Debian
apt update && apt install -y nginx

# CentOS
yum install -y nginx
```

#### 3.2 创建 Nginx 配置
```bash
vim /etc/nginx/sites-available/fidoo-blog
```

参考 `deploy/nginx.conf` 配置文件。

#### 3.3 启用配置
```bash
ln -s /etc/nginx/sites-available/fidoo-blog /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 4. 配置 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
certbot renew --dry-run
```

## 方式二：PM2 部署

### 1. 安装 Node.js 和 pnpm

```bash
# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 pnpm
npm install -g pnpm@10.20.0
```

### 2. 安装 PostgreSQL 和 Redis

```bash
# PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 创建数据库
sudo -u postgres psql
CREATE DATABASE fidoo_blog;
CREATE USER fidoo_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE fidoo_blog TO fidoo_user;
\q

# Redis
apt install -y redis-server
systemctl start redis
systemctl enable redis
```

### 3. 部署应用

```bash
# 克隆项目
cd /opt
git clone https://github.com/your-username/fidoo-blog.git
cd fidoo-blog

# 安装依赖
pnpm install

# 构建项目
pnpm build

# 配置环境变量
cp service/.env.example service/.env
vim service/.env
```

### 4. 使用 PM2 管理进程

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
cd /opt/fidoo-blog
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 设置开机自启
pm2 startup
pm2 save
```

## 监控和维护

### 查看日志

**Docker 方式：**
```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f service
docker-compose logs -f web
docker-compose logs -f admin
```

**PM2 方式：**
```bash
pm2 logs
pm2 logs service
pm2 logs web
pm2 logs admin
```

### 更新部署

```bash
cd /opt/fidoo-blog

# 拉取最新代码
git pull

# 重新构建
docker-compose build
# 或
pnpm build

# 重启服务
docker-compose restart
# 或
pm2 restart all

# 运行数据库迁移（如有）
docker-compose exec service pnpm migration:run
```

### 备份数据

```bash
# 备份 PostgreSQL
docker-compose exec postgres pg_dump -U postgres fidoo_blog > backup_$(date +%Y%m%d).sql

# 或使用本地 PostgreSQL
pg_dump -U fidoo_user fidoo_blog > backup_$(date +%Y%m%d).sql

# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz service/uploads/
```

### 性能优化

1. **启用 Gzip 压缩**（Nginx 配置中已包含）
2. **配置 CDN**（静态资源）
3. **Redis 缓存优化**
4. **数据库索引优化**
5. **启用 HTTP/2**

## 安全建议

1. **修改默认密码**：数据库、Redis、JWT Secret
2. **配置防火墙**：只开放必要端口
3. **使用 HTTPS**：配置 SSL 证书
4. **定期更新**：系统和依赖包
5. **限制 SSH 访问**：使用密钥认证
6. **配置 Fail2ban**：防止暴力破解
7. **定期备份**：数据库和文件

## 故障排查

### 服务无法启动

```bash
# 检查 Docker 容器状态
docker-compose ps
docker-compose logs

# 检查端口占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :3005

# 检查磁盘空间
df -h
```

### 数据库连接失败

```bash
# 测试数据库连接
docker-compose exec postgres psql -U postgres -d fidoo_blog

# 检查环境变量
docker-compose exec service env | grep DB_
```

### 性能问题

```bash
# 查看资源使用
docker stats
# 或
htop

# 查看数据库慢查询
docker-compose exec postgres psql -U postgres -d fidoo_blog -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## 常用命令

```bash
# 启动服务
docker-compose up -d
# 或
pm2 start ecosystem.config.js

# 停止服务
docker-compose down
# 或
pm2 stop all

# 重启服务
docker-compose restart
# 或
pm2 restart all

# 查看日志
docker-compose logs -f
# 或
pm2 logs

# 进入容器
docker-compose exec service sh
```

## 联系支持

如遇到问题，请查看：
- 项目文档：`README.md`
- 架构文档：`ARCHITECTURE.md`
- 脚本说明：`scripts/README.md`

