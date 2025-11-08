# 企业级部署指南 - 阿里云服务器

本文档提供在阿里云服务器上进行企业级部署的完整方案，包括安全配置、性能优化、监控告警等。

## 📋 目录

- [服务器准备](#服务器准备)
- [环境配置](#环境配置)
- [SSL 证书配置](#ssl-证书配置)
- [部署流程](#部署流程)
- [安全加固](#安全加固)
- [性能优化](#性能优化)
- [监控告警](#监控告警)
- [备份策略](#备份策略)
- [故障排查](#故障排查)

## 🖥️ 服务器准备

### 推荐配置

**最小配置（适合小规模使用）:**
- CPU: 2 核心
- 内存: 4GB
- 硬盘: 50GB SSD
- 带宽: 5Mbps

**推荐配置（适合中等规模）:**
- CPU: 4 核心
- 内存: 8GB
- 硬盘: 100GB SSD
- 带宽: 10Mbps

**高性能配置（适合大规模）:**
- CPU: 8 核心
- 内存: 16GB
- 硬盘: 200GB SSD
- 带宽: 20Mbps

### 操作系统

推荐使用 **Ubuntu 22.04 LTS** 或 **CentOS 7/8**

## 🔧 环境配置

### 1. 更新系统

```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

### 2. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 3. 配置防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 4. 克隆项目

```bash
# 安装 Git
sudo apt install git -y  # Ubuntu
# sudo yum install git -y  # CentOS

# 克隆项目
git clone https://github.com/fidoo/fidoo-blog.git
cd fidoo-blog
```

### 5. 生成密钥文件

```bash
# 运行密钥生成脚本
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh
```

这将生成以下密钥文件（保存在 `secrets/` 目录）:
- `postgres_password.txt` - PostgreSQL 密码
- `db_password.txt` - 数据库连接密码
- `redis_password.txt` - Redis 密码
- `jwt_secret.txt` - JWT 密钥
- `jwt_refresh_secret.txt` - JWT 刷新密钥

**⚠️ 重要**: 请妥善保管这些密钥文件，不要提交到版本控制系统！

### 6. 配置环境变量

创建 `.env.production` 文件：

```bash
cp service/env.example service/.env.production
vim service/.env.production
```

关键配置项：

```env
NODE_ENV=production
PORT=3005

# 数据库配置
DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_DATABASE=fidoo_blog

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379

# JWT 配置（从 secrets 文件读取）
JWT_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d

# 跨域配置（替换为你的域名）
CORS_ORIGINS=https://www.yourdomain.com,https://admin.yourdomain.com

# 日志配置
LOG_LEVEL=info
LOG_FILE_PATH=logs

# 限流配置
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# 前端 API 地址（替换为你的域名）
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

## 🔒 SSL 证书配置

### 方式一：使用 Let's Encrypt（推荐，免费）

```bash
# 安装 Certbot
sudo apt install certbot -y  # Ubuntu
# sudo yum install certbot -y  # CentOS

# 申请证书（替换为你的域名）
sudo certbot certonly --standalone -d api.yourdomain.com -d www.yourdomain.com -d yourdomain.com -d admin.yourdomain.com

# 证书位置
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# 复制证书到项目目录
sudo mkdir -p docker/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/certificate.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/private.key
sudo cp /etc/letsencrypt/live/yourdomain.com/chain.pem docker/nginx/ssl/ca.crt
sudo chown -R $USER:$USER docker/nginx/ssl
```

### 方式二：使用阿里云 SSL 证书

1. 在阿里云控制台申请 SSL 证书
2. 下载证书文件
3. 将证书文件放到 `docker/nginx/ssl/` 目录：
   - `certificate.crt` - 证书文件
   - `private.key` - 私钥文件
   - `ca.crt` - 证书链文件（可选）

### 配置自动续期（Let's Encrypt）

```bash
# 创建续期脚本
sudo vim /etc/cron.monthly/renew-ssl.sh
```

```bash
#!/bin/bash
certbot renew --quiet
cd /path/to/fidoo-blog
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/certificate.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/private.key
docker-compose restart nginx
```

```bash
sudo chmod +x /etc/cron.monthly/renew-ssl.sh
```

## 🚀 部署流程

### 1. 更新 Nginx 配置

编辑 `docker/nginx/nginx.prod.conf`，替换所有 `yourdomain.com` 为你的实际域名。

```bash
vim docker/nginx/nginx.prod.conf
```

### 2. 使用生产配置

在生产环境部署时，需要同时使用基础配置和生产配置：

```bash
# 构建镜像
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. 使用部署脚本（推荐）

```bash
# 赋予执行权限
chmod +x scripts/*.sh

# 执行部署
./scripts/deploy.sh production
```

部署脚本会自动：
- 检查环境
- 生成密钥（如需要）
- 备份现有数据
- 构建镜像
- 启动服务
- 运行数据库迁移
- 检查服务健康状态

### 4. 初始化数据库

```bash
# 进入后端容器
docker-compose exec service sh

# 运行数据库迁移
cd /app
npm run migration:run

# 运行种子数据（可选）
npm run seed

# 退出容器
exit
```

### 5. 验证部署

```bash
# 检查服务状态
./scripts/monitor.sh status

# 健康检查
./scripts/monitor.sh health

# 查看日志
./scripts/monitor.sh logs
```

## 🔐 安全加固

### 1. 修改默认端口

编辑 `docker-compose.prod.yml`，修改暴露的端口：

```yaml
services:
  postgres:
    ports:
      - '127.0.0.1:5432:5432'  # 只允许本地访问
  redis:
    ports:
      - '127.0.0.1:6379:6379'   # 只允许本地访问
```

### 2. 配置 SSH 密钥登录

```bash
# 生成 SSH 密钥对（在本地）
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id user@your-server-ip

# 禁用密码登录（在服务器上）
sudo vim /etc/ssh/sshd_config
# 设置: PasswordAuthentication no
sudo systemctl restart sshd
```

### 3. 配置 Fail2Ban

```bash
# 安装 Fail2Ban
sudo apt install fail2ban -y

# 配置
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo vim /etc/fail2ban/jail.local

# 启动服务
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. 定期更新系统

```bash
# 设置自动更新（Ubuntu）
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 5. 配置日志轮转

```bash
# 配置 Docker 日志轮转
sudo vim /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

## ⚡ 性能优化

### 1. 数据库优化

生产环境的 `docker-compose.prod.yml` 已包含 PostgreSQL 优化配置，可根据服务器配置调整：

```yaml
postgres:
  command:
    - postgres
    - -c
    - shared_buffers=256MB      # 根据内存调整
    - -c
    - effective_cache_size=1GB  # 根据内存调整
```

### 2. Redis 优化

```yaml
redis:
  command:
    - redis-server
    - --maxmemory 512mb         # 根据内存调整
    - --maxmemory-policy allkeys-lru
```

### 3. Nginx 优化

生产环境 Nginx 配置已包含：
- Gzip 压缩
- 连接池
- 缓存配置
- 限流配置

### 4. 应用层优化

- 启用 Redis 缓存
- 配置 CDN（推荐使用阿里云 CDN）
- 使用对象存储（OSS）存储静态文件

## 📊 监控告警

### 1. 使用监控脚本

```bash
# 查看服务状态
./scripts/monitor.sh status

# 健康检查
./scripts/monitor.sh health

# 资源统计
./scripts/monitor.sh stats

# 系统信息
./scripts/monitor.sh system
```

### 2. 配置 Prometheus + Grafana（可选）

参考开源社区的 Prometheus 配置方案，监控：
- 容器资源使用
- 数据库性能
- API 响应时间
- 错误率

### 3. 配置告警

#### 使用阿里云云监控

1. 在阿里云控制台配置云监控
2. 设置告警规则：
   - CPU 使用率 > 80%
   - 内存使用率 > 80%
   - 磁盘使用率 > 85%
   - 服务不可用

#### 使用邮件告警

配置邮件服务（在 `.env.production` 中）：

```env
MAIL_HOST=smtp.aliyun.com
MAIL_PORT=465
MAIL_USER=your-email@aliyun.com
MAIL_PASSWORD=your-password
MAIL_FROM=noreply@yourdomain.com
```

## 💾 备份策略

### 1. 手动备份

```bash
# 完整备份
./scripts/backup.sh full

# 仅备份数据库
./scripts/backup.sh db

# 仅备份文件
./scripts/backup.sh files
```

### 2. 自动备份（Cron）

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * cd /path/to/fidoo-blog && ./scripts/backup.sh full

# 每周日凌晨 3 点完整备份并清理旧备份
0 3 * * 0 cd /path/to/fidoo-blog && ./scripts/backup.sh full && find backups -name "*.gz" -mtime +30 -delete
```

### 3. 备份到阿里云 OSS

```bash
# 安装 OSS CLI
wget http://gosspublic.alicdn.com/ossutil/1.7.0/ossutil64
chmod 755 ossutil64
sudo mv ossutil64 /usr/local/bin/ossutil

# 配置
ossutil config

# 修改备份脚本，添加 OSS 上传功能
```

### 4. 恢复备份

```bash
# 恢复数据库
gunzip < backups/db_backup_20240101_120000.sql.gz | docker-compose exec -T postgres psql -U postgres fidoo_blog

# 恢复文件
tar xzf backups/uploads_backup_20240101_120000.tar.gz -C service/
```

## 🔍 故障排查

### 1. 服务无法启动

```bash
# 查看日志
docker-compose logs service
docker-compose logs postgres
docker-compose logs redis

# 检查配置
docker-compose config

# 检查端口占用
netstat -tulpn | grep :3005
```

### 2. 数据库连接失败

```bash
# 检查数据库状态
docker-compose ps postgres

# 测试连接
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# 检查环境变量
docker-compose exec service env | grep DB_
```

### 3. 性能问题

```bash
# 查看资源使用
./scripts/monitor.sh stats

# 查看数据库慢查询
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10"

# 查看 Redis 信息
docker-compose exec redis redis-cli INFO stats
```

### 4. SSL 证书问题

```bash
# 测试 SSL 配置
docker-compose exec nginx nginx -t

# 查看证书信息
openssl x509 -in docker/nginx/ssl/certificate.crt -text -noout
```

## 📝 维护清单

### 日常维护

- [ ] 每日检查服务状态
- [ ] 每周检查日志
- [ ] 每月检查备份
- [ ] 每季度更新依赖

### 定期任务

- [ ] 更新系统补丁
- [ ] 更新 Docker 镜像
- [ ] 更新 SSL 证书
- [ ] 清理旧日志和备份
- [ ] 性能优化评估

## 🆘 获取帮助

- GitHub Issues: https://github.com/fidoo/fidoo-blog/issues
- 文档站点: https://docs.fidoo-blog.com
- 技术支持: support@fidoo.com

## 📚 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [PostgreSQL 优化指南](https://www.postgresql.org/docs/current/performance-tips.html)
- [阿里云最佳实践](https://help.aliyun.com/)

---

**最后更新**: 2024-01-01

