# 阿里云 ECS 快速部署指南

## 一、准备工作

### 1. 服务器要求
- 系统：Ubuntu 20.04+ / CentOS 7+
- 配置：2核4G 以上
- 磁盘：20GB 以上

### 2. 连接服务器
```bash
ssh root@your-server-ip
```

## 二、快速部署（Docker 方式）

### 步骤 1: 安装 Docker
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证
docker --version
docker-compose --version
```

### 步骤 2: 克隆项目
```bash
cd /opt
git clone https://github.com/your-username/fidoo-blog.git
cd fidoo-blog
```

### 步骤 3: 配置环境变量
```bash
# 复制并编辑环境变量
cp service/.env.example service/.env.production
vim service/.env.production
```

**必须修改的配置：**
```env
# 数据库密码（必须修改）
DB_PASSWORD=your-strong-password-here

# Redis 密码（必须修改）
REDIS_PASSWORD=your-redis-password-here

# JWT 密钥（必须修改，建议使用随机字符串）
JWT_SECRET=your-very-strong-secret-key-change-this

# 应用域名
APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1
```

### 步骤 4: 修改 Docker Compose 配置
```bash
# 编辑生产环境配置
vim deploy/docker-compose.prod.yml
```

更新数据库和 Redis 密码（与环境变量一致）

### 步骤 5: 构建和启动
```bash
# 使用生产环境配置构建
docker-compose -f deploy/docker-compose.prod.yml build

# 启动服务
docker-compose -f deploy/docker-compose.prod.yml up -d

# 查看日志
docker-compose -f deploy/docker-compose.prod.yml logs -f
```

### 步骤 6: 运行数据库迁移
```bash
# 等待服务启动后（约30秒），运行迁移
docker-compose -f deploy/docker-compose.prod.yml exec service sh -c "cd /app/service && pnpm migration:run"

# 可选：运行种子数据
docker-compose -f deploy/docker-compose.prod.yml exec service sh -c "cd /app/service && pnpm seed"
```

### 步骤 7: 配置 Nginx（可选但推荐）

#### 安装 Nginx
```bash
apt update && apt install -y nginx
```

#### 创建配置文件
```bash
# 复制配置文件
cp deploy/nginx.conf /etc/nginx/sites-available/fidoo-blog

# 编辑配置文件，修改域名
vim /etc/nginx/sites-available/fidoo-blog
# 将 your-domain.com 替换为你的域名

# 启用配置
ln -s /etc/nginx/sites-available/fidoo-blog /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # 删除默认配置

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

#### 配置 SSL 证书
```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书（替换为你的域名）
certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
certbot renew --dry-run
```

### 步骤 8: 配置防火墙
```bash
# 开放端口
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

## 三、验证部署

### 检查服务状态
```bash
# Docker 容器状态
docker-compose -f deploy/docker-compose.prod.yml ps

# 服务健康检查
curl http://localhost:3000      # 前台
curl http://localhost:3001      # 后台
curl http://localhost:3005/health  # 后端健康检查
```

### 访问服务
- 前台网站: `http://your-server-ip:3000` 或 `https://your-domain.com`
- 后台管理: `http://your-server-ip:3001` 或 `https://your-domain.com/admin`
- API 文档: `http://your-server-ip:3005/api/docs` 或 `https://your-domain.com/api/docs`

## 四、常用命令

### 查看日志
```bash
# 所有服务
docker-compose -f deploy/docker-compose.prod.yml logs -f

# 特定服务
docker-compose -f deploy/docker-compose.prod.yml logs -f service
docker-compose -f deploy/docker-compose.prod.yml logs -f web
docker-compose -f deploy/docker-compose.prod.yml logs -f admin
```

### 重启服务
```bash
docker-compose -f deploy/docker-compose.prod.yml restart
```

### 停止服务
```bash
docker-compose -f deploy/docker-compose.prod.yml down
```

### 更新部署
```bash
cd /opt/fidoo-blog
git pull
docker-compose -f deploy/docker-compose.prod.yml build
docker-compose -f deploy/docker-compose.prod.yml up -d

# 运行数据库迁移（如有）
docker-compose -f deploy/docker-compose.prod.yml exec service sh -c "cd /app/service && pnpm migration:run"
```

### 备份数据
```bash
# 备份数据库
docker-compose -f deploy/docker-compose.prod.yml exec postgres pg_dump -U postgres fidoo_blog > backup_$(date +%Y%m%d).sql

# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz service/uploads/
```

## 五、故障排查

### 服务无法启动
```bash
# 查看容器状态
docker-compose -f deploy/docker-compose.prod.yml ps

# 查看日志
docker-compose -f deploy/docker-compose.prod.yml logs

# 检查端口占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :3005
```

### 数据库连接失败
```bash
# 测试数据库连接
docker-compose -f deploy/docker-compose.prod.yml exec postgres psql -U postgres -d fidoo_blog

# 检查环境变量
docker-compose -f deploy/docker-compose.prod.yml exec service env | grep DB_
```

### 性能问题
```bash
# 查看资源使用
docker stats

# 查看系统资源
htop
df -h
free -h
```

## 六、安全建议

1. **修改默认密码**：数据库、Redis、JWT Secret
2. **配置防火墙**：只开放必要端口
3. **使用 HTTPS**：配置 SSL 证书
4. **定期更新**：系统和 Docker 镜像
5. **限制 SSH**：使用密钥认证，禁用密码登录
6. **配置 Fail2ban**：防止暴力破解
7. **定期备份**：数据库和文件

## 七、性能优化

1. **启用 CDN**：静态资源使用 CDN
2. **配置缓存**：Redis 缓存优化
3. **数据库优化**：添加索引，优化查询
4. **监控告警**：配置监控和告警

## 需要帮助？

- 详细文档：查看 `DEPLOY.md`
- 架构说明：查看 `ARCHITECTURE.md`
- 脚本说明：查看 `scripts/README.md`

