# 部署配置文件目录

本目录包含生产环境部署相关的配置文件。

## 文件说明

### 1. QUICK_START.md
**快速部署指南** - 适合首次部署，包含完整的步骤说明。

### 2. nginx.conf
**Nginx 反向代理配置** - 包含：
- HTTPS 配置
- 反向代理配置
- WebSocket 支持
- 静态文件缓存
- 安全头设置

**使用方法：**
```bash
# 复制到 Nginx 配置目录
cp deploy/nginx.conf /etc/nginx/sites-available/fidoo-blog

# 编辑配置文件，修改域名
vim /etc/nginx/sites-available/fidoo-blog

# 启用配置
ln -s /etc/nginx/sites-available/fidoo-blog /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 3. docker-compose.prod.yml
**生产环境 Docker Compose 配置** - 包含：
- 优化的 PostgreSQL 配置
- Redis 密码保护
- 资源限制
- 健康检查
- 数据持久化

**使用方法：**
```bash
# 使用生产环境配置
docker-compose -f deploy/docker-compose.prod.yml up -d

# 或使用部署脚本
./scripts/deploy.sh docker production
```

### 4. ecosystem.config.js
**PM2 进程管理配置** - 用于 PM2 部署方式。

**使用方法：**
```bash
# 启动所有服务
pm2 start deploy/ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs
```

## 部署方式选择

### Docker Compose（推荐）
- ✅ 简单快速
- ✅ 环境隔离
- ✅ 易于管理
- ✅ 适合单机部署

### PM2
- ✅ 更灵活
- ✅ 更好的资源控制
- ✅ 适合需要精细控制的场景

## 部署步骤

### 快速部署（推荐）
查看 `QUICK_START.md` 获取详细步骤。

### 完整部署
查看根目录的 `DEPLOY.md` 获取完整文档。

## 配置要点

### 1. 环境变量
必须配置 `service/.env.production`：
- `DB_PASSWORD` - 数据库密码
- `REDIS_PASSWORD` - Redis 密码
- `JWT_SECRET` - JWT 密钥（必须修改）
- `APP_URL` - 应用域名
- `NEXT_PUBLIC_API_URL` - API 地址

### 2. Nginx 配置
- 修改 `your-domain.com` 为实际域名
- 配置 SSL 证书路径
- 调整代理地址（如果使用 Docker，使用容器名称）

### 3. Docker Compose
- 更新数据库和 Redis 密码
- 配置资源限制
- 设置数据卷路径

## 安全建议

1. **修改所有默认密码**
2. **使用 HTTPS**
3. **配置防火墙**
4. **定期更新**
5. **启用备份**

## 监控和维护

### 查看日志
```bash
# Docker 方式
docker-compose -f deploy/docker-compose.prod.yml logs -f

# PM2 方式
pm2 logs
```

### 备份数据
```bash
# 数据库备份
docker-compose -f deploy/docker-compose.prod.yml exec postgres pg_dump -U postgres fidoo_blog > backup.sql

# 文件备份
tar -czf uploads_backup.tar.gz service/uploads/
```

### 更新部署
```bash
cd /opt/fidoo-blog
git pull
./scripts/deploy.sh docker production
```

## 需要帮助？

- 快速开始：查看 `QUICK_START.md`
- 详细文档：查看根目录 `DEPLOY.md`
- 架构说明：查看根目录 `ARCHITECTURE.md`

