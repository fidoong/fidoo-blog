# 使用公网 IP 部署指南

如果没有域名，可以使用公网 IP 直接部署。本指南说明如何使用 IP 地址访问服务。

## 📋 配置说明

### 访问路径

使用 IP 部署后，所有服务通过同一个 IP 的不同路径访问：

- **前台网站**: `http://你的公网IP/`
- **管理后台**: `http://你的公网IP/admin`
- **API 服务**: `http://你的公网IP/api`
- **API 文档**: `http://你的公网IP/api/docs`
- **健康检查**: `http://你的公网IP/health`

## 🔧 配置步骤

### 1. 使用 IP 配置的 Nginx

项目已提供 `docker/nginx/nginx.ip.conf` 配置文件，使用路径路由：

```bash
# 确保使用 IP 配置
# docker-compose.prod.yml 中已配置为使用 nginx.ip.conf
```

### 2. 配置环境变量

编辑 `service/.env.production`：

```env
# 应用配置
NODE_ENV=production
PORT=3005

# 跨域配置（使用 IP 地址）
CORS_ORIGINS=http://120.55.3.205,http://120.55.3.205/admin

# 前端 API 地址（使用 IP）
NEXT_PUBLIC_API_URL=http://120.55.3.205/api/v1
```

**注意**: 将 `120.55.3.205` 替换为你的实际公网 IP。

### 3. 前端配置调整

如果前端需要配置 API 地址，确保使用 IP：

```bash
# web/.env.local (如果存在)
NEXT_PUBLIC_API_URL=http://120.55.3.205/api/v1
```

## 🚀 部署步骤

### 1. 准备服务器

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 配置防火墙（仅开放 HTTP）
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

### 2. 部署项目

```bash
# 克隆项目
git clone https://github.com/fidoo/fidoo-blog.git
cd fidoo-blog

# 生成密钥
chmod +x scripts/*.sh
./scripts/setup-secrets.sh

# 配置环境变量（使用你的公网 IP）
cp service/env.example service/.env.production
vim service/.env.production
# 修改 CORS_ORIGINS 和 NEXT_PUBLIC_API_URL 为你的 IP

# 部署
./scripts/deploy.sh production
```

### 3. 初始化数据库

```bash
# 等待服务启动
sleep 10

# 运行数据库迁移
docker-compose exec service sh -c "cd /app && npm run migration:run"
```

## 🌐 访问服务

部署完成后，通过以下地址访问：

### 前台网站
```
http://120.55.3.205/
```

### 管理后台
```
http://120.55.3.205/admin
```

### API 服务
```
http://120.55.3.205/api/v1
```

### API 文档
```
http://120.55.3.205/api/docs
```

## ⚠️ 注意事项

### 1. 安全考虑

- **仅使用 HTTP**: IP 访问通常不使用 HTTPS（需要自签名证书）
- **防火墙配置**: 只开放必要的端口（22, 80）
- **强密码**: 确保数据库和 Redis 使用强密码
- **访问控制**: 考虑在应用层添加 IP 白名单

### 2. CORS 配置

确保 `CORS_ORIGINS` 包含你的 IP 地址：

```env
CORS_ORIGINS=http://120.55.3.205,http://120.55.3.205/admin
```

### 3. 前端 API 配置

前端需要知道 API 地址，确保 `NEXT_PUBLIC_API_URL` 配置正确：

```env
NEXT_PUBLIC_API_URL=http://120.55.3.205/api/v1
```

### 4. 路径路由说明

- `/` - 前台网站
- `/admin` - 管理后台
- `/api` - API 服务
- `/health` - 健康检查

## 🔒 后续升级到域名（可选）

如果将来购买域名，可以：

1. 配置 DNS 解析指向你的 IP
2. 申请 SSL 证书（Let's Encrypt）
3. 切换到 `docker/nginx/nginx.prod.conf` 配置
4. 更新环境变量中的域名

## 📊 验证部署

```bash
# 检查服务状态
./scripts/monitor.sh status

# 健康检查
./scripts/monitor.sh health

# 测试访问
curl http://120.55.3.205/health
curl http://120.55.3.205/api/v1
```

## 🆘 故障排查

### 无法访问

1. **检查防火墙**
   ```bash
   sudo ufw status
   ```

2. **检查服务状态**
   ```bash
   docker-compose ps
   ./scripts/monitor.sh status
   ```

3. **检查 Nginx 日志**
   ```bash
   docker-compose logs nginx
   ```

### CORS 错误

如果前端出现 CORS 错误，检查：

1. `CORS_ORIGINS` 是否包含正确的 IP
2. 前端请求的 URL 是否正确

---

**提示**: 使用 IP 访问适合测试和小规模使用。生产环境建议使用域名和 HTTPS。

