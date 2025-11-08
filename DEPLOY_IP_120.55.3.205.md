# 部署配置 - 公网 IP: 120.55.3.205

本文档说明使用公网 IP `120.55.3.205` 的部署配置。

## ✅ 已配置项

### 1. Docker Compose 配置

- ✅ `CORS_ORIGINS`: `http://120.55.3.205,http://120.55.3.205/admin`
- ✅ `NEXT_PUBLIC_API_URL`: `http://120.55.3.205/api/v1`
- ✅ Nginx 配置: 使用 `nginx.ip.conf`（路径路由）

### 2. 访问地址

部署完成后，通过以下地址访问：

- **前台网站**: http://120.55.3.205/
- **管理后台**: http://120.55.3.205/admin
- **API 服务**: http://120.55.3.205/api/v1
- **API 文档**: http://120.55.3.205/api/docs
- **健康检查**: http://120.55.3.205/health

## 🚀 快速部署步骤

### 在服务器上执行：

```bash
# 1. 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 2. 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable

# 3. 克隆项目
git clone https://github.com/fidoo/fidoo-blog.git
cd fidoo-blog

# 4. 生成密钥
chmod +x scripts/*.sh
./scripts/setup-secrets.sh

# 5. 配置环境变量（可选，已有默认值）
cp service/env.example service/.env.production
# 如果需要自定义，编辑: vim service/.env.production

# 6. 部署
./scripts/deploy.sh production

# 7. 等待服务启动并初始化数据库
sleep 15
docker-compose exec service sh -c "cd /app && npm run migration:run"
```

## 🔍 验证部署

```bash
# 检查服务状态
./scripts/monitor.sh status

# 健康检查
./scripts/monitor.sh health

# 测试访问
curl http://120.55.3.205/health
curl http://120.55.3.205/api/v1
```

## 📝 环境变量说明

如果需要在 `service/.env.production` 中自定义，可以设置：

```env
# 跨域配置（默认已配置为 IP）
CORS_ORIGINS=http://120.55.3.205,http://120.55.3.205/admin

# 前端 API 地址（默认已配置为 IP）
NEXT_PUBLIC_API_URL=http://120.55.3.205/api/v1
```

**注意**: 如果不设置这些变量，会使用 `docker-compose.prod.yml` 中的默认值。

## ⚠️ 注意事项

1. **防火墙**: 确保服务器防火墙开放 80 端口
2. **安全**: 使用 IP 访问时仅支持 HTTP，建议后续配置域名和 HTTPS
3. **CORS**: 确保前端请求的 Origin 在 CORS_ORIGINS 列表中

## 🆘 故障排查

### 无法访问

```bash
# 检查服务状态
docker-compose ps

# 检查 Nginx 日志
docker-compose logs nginx

# 检查防火墙
sudo ufw status
```

### CORS 错误

如果前端出现 CORS 错误，检查：

1. `CORS_ORIGINS` 是否包含正确的 IP
2. 前端请求的 URL 是否正确

---

**配置完成时间**: 2024-01-01  
**公网 IP**: 120.55.3.205

