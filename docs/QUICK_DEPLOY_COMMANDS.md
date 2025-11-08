# 快速部署命令（服务器上执行）

项目克隆完成后，在服务器上执行以下命令。

## 🚀 一键部署命令

```bash
# 进入项目目录
cd fidoo-blog

# 生成密钥并部署
chmod +x scripts/*.sh && ./scripts/setup-secrets.sh && ./scripts/deploy.sh production
```

## 📋 分步执行（推荐，可以看到每一步的输出）

### 步骤 1: 进入项目目录

```bash
cd fidoo-blog
```

### 步骤 2: 添加执行权限

```bash
chmod +x scripts/*.sh
```

### 步骤 3: 生成密钥文件

```bash
./scripts/setup-secrets.sh
```

这会生成以下密钥文件：
- `secrets/postgres_password.txt`
- `secrets/db_password.txt`
- `secrets/redis_password.txt`
- `secrets/jwt_secret.txt`
- `secrets/jwt_refresh_secret.txt`

### 步骤 4: 开始部署

```bash
./scripts/deploy.sh production
```

部署过程会：
- 检查环境
- 构建 Docker 镜像
- 启动所有服务
- 运行数据库迁移
- 检查服务健康状态

**预计时间**：5-10 分钟（取决于网络和服务器性能）

### 步骤 5: 等待服务启动

```bash
# 等待服务启动（约 30-60 秒）
sleep 30

# 检查服务状态
docker-compose ps
```

### 步骤 6: 初始化数据库（如果部署脚本没有自动执行）

```bash
# 运行数据库迁移
docker-compose exec service sh -c "cd /app && npm run migration:run"
```

### 步骤 7: 验证部署

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

- ✅ 所有服务状态为 `Up`
- ✅ 健康检查返回 `200 OK`
- ✅ 可以通过 IP 访问网站

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
```

## 📝 常用命令

```bash
# 查看服务状态
docker-compose ps
./scripts/monitor.sh status

# 查看日志
docker-compose logs -f service
./scripts/monitor.sh logs

# 备份
./scripts/backup.sh full

# 重启服务
docker-compose restart
```

---

**现在就开始部署吧！** 执行 `cd fidoo-blog && chmod +x scripts/*.sh && ./scripts/setup-secrets.sh && ./scripts/deploy.sh production`

