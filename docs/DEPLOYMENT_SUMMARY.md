# 部署配置总结

## 📋 服务器配置

- **CPU**: 2 核（vCPU）
- **内存**: 2 GiB
- **系统盘**: 40 GiB ESSD Entry 云盘
- **公网带宽**: 3 Mbps
- **操作系统**: Ubuntu 24.04 64位

## ✅ 已完成的优化调整

### 1. PostgreSQL 数据库优化

针对 2G 内存服务器优化：

| 参数 | 原值 | 优化后 | 说明 |
|------|------|--------|------|
| max_connections | 200 | 100 | 减少连接数，降低内存占用 |
| shared_buffers | 256MB | 128MB | 减少共享缓冲区 |
| effective_cache_size | 1GB | 512MB | 适配 2G 内存 |
| work_mem | 4MB | 2MB | 减少每个连接的工作内存 |
| max_wal_size | 4GB | 1GB | 适配 40GB 磁盘 |
| min_wal_size | 1GB | 512MB | 减少 WAL 文件大小 |

### 2. Redis 缓存优化

| 参数 | 原值 | 优化后 | 说明 |
|------|------|--------|------|
| maxmemory | 512MB | 256MB | 减少内存占用 |

### 3. 服务资源限制优化

#### 后端服务 (Service)
- CPU: 2核 → **1核**
- 内存: 2G → **512MB**

#### 前台网站 (Web)
- CPU: 1核 → **0.5核**
- 内存: 1G → **512MB**

#### 后台管理 (Admin)
- CPU: 1核 → **0.5核**
- 内存: 1G → **512MB**

#### Nginx 反向代理
- CPU: 1核 → **0.5核**
- 内存: 512MB → **256MB**

### 4. Nginx 配置优化

- worker_connections: 2048 → **1024**（适配小服务器）

## 📊 资源分配总览

### 内存分配（总计约 1.8GB）

```
PostgreSQL:    ~200MB  (shared_buffers + 其他开销)
Redis:         256MB   (maxmemory)
Service:       512MB   (应用服务)
Web:           512MB   (Next.js)
Admin:        512MB   (Next.js)
Nginx:        256MB   (反向代理)
系统预留:      ~200MB  (操作系统)
─────────────────────────────
总计:          ~2.4GB  (包含系统开销)
```

**注意**: 实际内存使用会根据负载动态调整，Docker 的资源限制只是上限。

### CPU 分配（总计 2 核）

```
Service:       1.0 核  (主要业务逻辑)
Web:           0.5 核  (前台网站)
Admin:         0.5 核  (管理后台)
Nginx:         0.5 核  (反向代理)
PostgreSQL/Redis: 共享剩余资源
─────────────────────────────
总计:          2.5 核  (允许超分配)
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

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
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

# 配置环境变量
cp service/env.example service/.env.production
vim service/.env.production  # 修改域名等配置

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

## 📈 性能监控

### 监控命令

```bash
# 查看服务状态
./scripts/monitor.sh status

# 健康检查
./scripts/monitor.sh health

# 资源统计
./scripts/monitor.sh stats

# 查看日志
./scripts/monitor.sh logs
```

### 关键指标

- **内存使用率**: 应保持在 85% 以下
- **CPU 使用率**: 应保持在 70% 以下
- **磁盘使用率**: 应保持在 80% 以下
- **数据库连接数**: 应保持在 80 以下（max_connections=100）

## ⚠️ 注意事项

### 1. 内存管理

- 定期监控内存使用情况
- 如果出现 OOM 错误，考虑升级配置或进一步优化
- 启用 Redis 缓存以减少数据库查询

### 2. 磁盘管理

- 定期清理日志文件
- 定期清理旧备份（保留最近 7-30 天）
- 监控磁盘使用率

### 3. 性能优化建议

- 使用 CDN 加速静态资源
- 启用 Gzip 压缩（已配置）
- 使用对象存储（OSS）存储上传文件
- 定期清理 Docker 未使用的资源

## 🔧 故障排查

### 内存不足

```bash
# 检查内存使用
free -h
docker stats --no-stream

# 清理 Docker 资源
docker system prune -f
```

### 磁盘空间不足

```bash
# 检查磁盘使用
df -h

# 清理日志
find service/logs -name "*.log" -mtime +7 -delete

# 清理备份
find backups -name "*.gz" -mtime +30 -delete

# 清理 Docker
docker system prune -a -f
```

## 📚 相关文档

- [快速部署指南](./QUICK_DEPLOY.md)
- [企业级部署指南](./ENTERPRISE_DEPLOYMENT.md)
- [2核2G 服务器优化说明](./SERVER_2C2G_OPTIMIZATION.md)

---

**最后更新**: 2024-01-01

