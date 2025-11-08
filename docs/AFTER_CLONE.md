# 克隆完成后的部署步骤

项目克隆完成后，按照以下步骤继续部署。

## 📋 克隆完成后的步骤

### 1. 进入项目目录

```bash
cd fidoo-blog
```

### 2. 检查项目文件

```bash
# 查看项目结构
ls -la

# 确认关键文件存在
ls -la docker-compose.prod.yml
ls -la scripts/
```

### 3. 生成密钥文件

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

### 4. 配置环境变量（可选）

```bash
# 复制环境变量模板
cp service/env.example service/.env.production

# 如果需要自定义，编辑环境变量
# vim service/.env.production
```

**注意**：如果不编辑，会使用 `docker-compose.prod.yml` 中的默认值（已配置为 IP: 120.55.3.205）

### 5. 部署服务

```bash
# 使用部署脚本
./scripts/deploy.sh production
```

部署脚本会自动：
- 检查环境
- 备份现有数据（如果有）
- 构建 Docker 镜像
- 启动所有服务
- 运行数据库迁移
- 检查服务健康状态

### 6. 等待服务启动

```bash
# 等待服务启动（约 30-60 秒）
sleep 30

# 检查服务状态
docker-compose ps
```

### 7. 初始化数据库

```bash
# 运行数据库迁移
docker-compose exec service sh -c "cd /app && npm run migration:run"

# 如果需要，运行种子数据（可选）
# docker-compose exec service sh -c "cd /app && npm run seed"
```

### 8. 验证部署

```bash
# 检查服务状态
./scripts/monitor.sh status

# 健康检查
./scripts/monitor.sh health

# 测试访问
curl http://localhost/health
curl http://localhost/api/v1
```

## ✅ 部署成功标志

如果看到以下内容，说明部署成功：

- 所有服务状态为 `Up`
- 健康检查返回正常
- 可以通过 IP 访问网站

## 🌐 访问地址

部署成功后，通过以下地址访问：

- **前台网站**: http://120.55.3.205/
- **管理后台**: http://120.55.3.205/admin
- **API 服务**: http://120.55.3.205/api/v1
- **API 文档**: http://120.55.3.205/api/docs

## 🔧 如果遇到问题

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f service
docker-compose logs -f postgres
docker-compose logs -f nginx
```

### 检查服务状态

```bash
# 查看服务状态
docker-compose ps

# 查看资源使用
./scripts/monitor.sh stats
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart service
docker-compose restart nginx
```

---

**提示**：克隆完成后，直接执行 `cd fidoo-blog && chmod +x scripts/*.sh && ./scripts/setup-secrets.sh && ./scripts/deploy.sh production` 即可开始部署。

