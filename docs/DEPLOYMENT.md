# 部署指南

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker >= 20.10.0
- Docker Compose >= 2.0.0
- PostgreSQL >= 16.0 (如果不使用 Docker)
- Redis >= 7.0 (如果不使用 Docker)

## 开发环境部署

### 1. 克隆项目

```bash
git clone https://github.com/fidoo/fidoo-blog.git
cd fidoo-blog
```

### 2. 安装依赖

```bash
# 安装 pnpm (如果未安装)
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp service/env.example service/.env

# 编辑环境变量
vim service/.env
```

必要的环境变量：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=fidoo_blog

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-secret-key-change-in-production
```

### 4. 启动数据库 (使用 Docker)

```bash
# 仅启动数据库服务
docker-compose up -d postgres redis
```

### 5. 运行数据库迁移

```bash
cd service
pnpm migration:run
```

### 6. 启动开发服务器

```bash
# 从项目根目录

# 启动后端服务
pnpm service:dev

# 启动前台网站 (新终端)
pnpm web:dev

# 启动后台管理 (新终端)
pnpm admin:dev
```

访问地址：

- API 服务: http://localhost:3000
- API 文档: http://localhost:3000/api/docs
- 前台网站: http://localhost:3001
- 后台管理: http://localhost:3002

## Docker 部署

### 完整部署 (推荐)

使用 Docker Compose 一键部署所有服务：

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 仅部署后端服务

```bash
# 启动数据库和后端
docker-compose up -d postgres redis service
```

### 服务管理

```bash
# 查看服务状态
docker-compose ps

# 重启服务
docker-compose restart service

# 查看特定服务日志
docker-compose logs -f service

# 进入容器
docker-compose exec service sh
```

## 生产环境部署

### 1. 准备服务器

推荐配置：

- CPU: 2 核心+
- 内存: 4GB+
- 硬盘: 50GB+
- 操作系统: Ubuntu 22.04 LTS

### 2. 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 配置环境变量

```bash
# 创建生产环境配置
cp service/env.example service/.env.production

# 编辑生产环境变量
vim service/.env.production
```

重要的生产环境配置：

```env
NODE_ENV=production

# 数据库配置 (使用强密码)
DB_PASSWORD=your-strong-password

# JWT 密钥 (使用随机生成的强密钥)
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret

# 跨域配置
CORS_ORIGINS=https://www.yourdomain.com,https://admin.yourdomain.com

# 日志级别
LOG_LEVEL=info
```

### 4. SSL 证书配置

```bash
# 创建 SSL 目录
mkdir -p docker/nginx/ssl

# 将证书文件放入目录
# - docker/nginx/ssl/certificate.crt
# - docker/nginx/ssl/private.key
```

更新 Nginx 配置以支持 HTTPS。

### 5. 部署应用

```bash
# 构建生产镜像
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 查看日志
docker-compose logs -f
```

### 6. 数据库初始化

```bash
# 进入后端容器
docker-compose exec service sh

# 运行迁移
npm run migration:run

# 运行种子数据 (可选)
npm run seed
```

### 7. 配置反向代理

如果使用外部 Nginx，配置示例：

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 数据备份

### 数据库备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U postgres fidoo_blog > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker-compose exec -T postgres psql -U postgres fidoo_blog < backup.sql
```

### Redis 备份

```bash
# Redis 自动持久化到 redis_data 卷
# 备份 Redis 数据
docker run --rm -v fidoo-blog_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### 文件备份

```bash
# 备份上传的文件
tar czf uploads_backup_$(date +%Y%m%d).tar.gz service/uploads
```

## 监控和维护

### 日志管理

```bash
# 查看应用日志
docker-compose logs -f service

# 查看错误日志
docker-compose exec service tail -f logs/error.log

# 清理旧日志
find service/logs -name "*.log" -mtime +30 -delete
```

### 性能监控

```bash
# 查看容器资源使用
docker stats

# 查看系统信息
curl http://localhost:3000/api/v1/system/info
```

### 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
docker-compose build
docker-compose up -d

# 运行新的迁移
docker-compose exec service npm run migration:run
```

## 故障排查

### 容器无法启动

```bash
# 查看容器日志
docker-compose logs service

# 检查配置
docker-compose config
```

### 数据库连接失败

```bash
# 检查数据库是否启动
docker-compose ps postgres

# 测试数据库连接
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# 检查环境变量
docker-compose exec service env | grep DB_
```

### 性能问题

```bash
# 检查数据库连接数
docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity"

# 检查 Redis 连接
docker-compose exec redis redis-cli INFO clients

# 查看慢查询
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10"
```

## 安全建议

1. **使用强密码** - 数据库、Redis、JWT 密钥
2. **启用 HTTPS** - 使用 SSL/TLS 证书
3. **防火墙配置** - 只开放必要的端口
4. **定期更新** - 及时更新依赖和系统补丁
5. **备份策略** - 每日自动备份数据库和文件
6. **监控告警** - 配置监控和告警系统
7. **限流配置** - 防止 DDoS 攻击
8. **日志审计** - 定期审查系统日志

## 扩展性

### 水平扩展

```yaml
# docker-compose.scale.yml
services:
  service:
    deploy:
      replicas: 3
```

```bash
# 扩展服务实例
docker-compose up -d --scale service=3
```

### 负载均衡

使用 Nginx 或云服务商的负载均衡器。

### 数据库读写分离

配置主从复制，读操作使用从库。

## 支持

如有问题，请查看：

- [GitHub Issues](https://github.com/fidoo/fidoo-blog/issues)
- [文档站点](https://docs.fidoo-blog.com)
- Email: support@fidoo.com
