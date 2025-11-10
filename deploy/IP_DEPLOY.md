# 使用公网 IP 部署指南

## 📋 概述

本指南说明如何使用公网 IP 地址（不使用域名）部署 Fidoo Blog。

## ⚠️ 注意事项

### 使用 IP 的限制

1. **无法使用 SSL 证书**：Let's Encrypt 等免费证书需要域名，IP 地址无法申请
2. **HTTP 协议**：只能使用 HTTP，不能使用 HTTPS
3. **浏览器警告**：某些浏览器可能对 HTTP 连接有安全警告
4. **OAuth 登录**：部分 OAuth 提供商（如 GitHub）可能不支持 IP 地址回调

### 适用场景

- 测试环境
- 内网部署
- 临时演示
- 开发调试

## 🚀 部署步骤

### 1. 获取服务器公网 IP

```bash
# 在服务器上查看公网 IP
curl ifconfig.me
# 或
curl ip.sb
```

假设你的公网 IP 是：`123.456.789.012`

### 2. 配置环境变量

编辑 `service/.env.production`：

```bash
vim service/.env.production
```

修改以下配置（将 `YOUR_SERVER_IP` 替换为实际 IP）：

```env
# 应用 URL（使用 IP）
APP_URL=http://123.456.789.012:3005

# CORS 配置（使用 IP）
CORS_ORIGIN=http://123.456.789.012:3000,http://123.456.789.012:3001
```

### 3. 配置前端 API 地址

编辑 `deploy/docker-compose.prod.yml`，或设置环境变量：

```bash
# 方式一：修改 docker-compose.prod.yml
vim deploy/docker-compose.prod.yml
# 将 YOUR_SERVER_IP 替换为实际 IP

# 方式二：使用环境变量
export NEXT_PUBLIC_API_URL=http://123.456.789.012:3005/api/v1
```

### 4. 配置防火墙

```bash
# 开放必要端口
ufw allow 3000/tcp  # 前台网站
ufw allow 3001/tcp  # 后台管理
ufw allow 3005/tcp  # 后端 API
ufw enable
```

### 5. 部署服务

```bash
# 使用部署脚本
./scripts/deploy.sh docker production

# 或手动部署
docker-compose -f deploy/docker-compose.prod.yml build
docker-compose -f deploy/docker-compose.prod.yml up -d
```

### 6. 运行数据库迁移

```bash
docker-compose -f deploy/docker-compose.prod.yml exec service sh -c "cd /app/service && pnpm migration:run"
```

## 🌐 访问地址

部署完成后，通过以下地址访问：

- **前台网站**: `http://123.456.789.012:3000`
- **后台管理**: `http://123.456.789.012:3001`
- **API 文档**: `http://123.456.789.012:3005/api/docs`
- **健康检查**: `http://123.456.789.012:3005/health`

## 🔧 可选：配置 Nginx（简化版）

如果不想直接暴露端口，可以使用 Nginx 反向代理（不使用 SSL）：

```nginx
# /etc/nginx/sites-available/fidoo-blog-ip

server {
    listen 80;
    server_name _;  # 接受所有域名/IP

    # 前台网站
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 后台管理
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # API
    location /api {
        proxy_pass http://localhost:3005/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

然后：

```bash
# 启用配置
ln -s /etc/nginx/sites-available/fidoo-blog-ip /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# 只开放 80 端口
ufw allow 80/tcp
```

访问地址变为：
- `http://123.456.789.012/` - 前台
- `http://123.456.789.012/admin` - 后台
- `http://123.456.789.012/api` - API

## 🔒 安全建议

使用 IP 部署时，建议：

1. **修改默认密码**：数据库、Redis、JWT Secret
2. **配置防火墙**：只开放必要端口
3. **使用强密码**：所有密码使用强密码
4. **限制访问**：使用防火墙规则限制访问来源
5. **定期更新**：系统和依赖包
6. **监控日志**：定期检查访问日志

## 📝 快速配置脚本

创建快速配置脚本：

```bash
#!/bin/bash
# 快速配置 IP 部署

read -p "请输入服务器公网 IP: " SERVER_IP

# 更新 .env.production
sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" service/.env.production

# 更新 docker-compose.prod.yml
sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" deploy/docker-compose.prod.yml

echo "✅ 配置完成！"
echo "前台: http://$SERVER_IP:3000"
echo "后台: http://$SERVER_IP:3001"
echo "API: http://$SERVER_IP:3005/api"
```

## 🆚 IP vs 域名对比

| 特性 | IP 地址 | 域名 |
|------|---------|------|
| SSL 证书 | ❌ 不支持 | ✅ 支持 |
| HTTPS | ❌ 不支持 | ✅ 支持 |
| 易记性 | ❌ 难记 | ✅ 易记 |
| 配置复杂度 | ✅ 简单 | ⚠️ 需要 DNS |
| 成本 | ✅ 免费 | ⚠️ 域名费用 |
| 适用场景 | 测试/内网 | 生产环境 |

## 💡 后续升级到域名

如果后续需要升级到域名：

1. 购买域名并解析到服务器 IP
2. 配置 SSL 证书
3. 更新环境变量中的域名
4. 重新部署服务

参考 `QUICK_START.md` 中的域名配置部分。

