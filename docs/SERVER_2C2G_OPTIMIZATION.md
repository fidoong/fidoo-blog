# 2核2G 服务器优化配置说明

本文档说明针对 **2核2G 内存、40GB 磁盘** 的阿里云服务器所做的优化调整。

## 📊 资源分配

### 内存分配（总计约 1.8GB，预留 200MB 给系统）

| 服务 | 内存限制 | 说明 |
|------|---------|------|
| PostgreSQL | ~200MB | shared_buffers=128MB + 其他开销 |
| Redis | 256MB | maxmemory=256MB |
| Service (后端) | 512MB | 应用服务 |
| Web (前台) | 512MB | Next.js 应用 |
| Admin (后台) | 512MB | Next.js 应用 |
| Nginx | 128MB | 反向代理 |
| **总计** | **~2.1GB** | 包含系统开销 |

### CPU 分配（总计 2 核）

| 服务 | CPU 限制 | 说明 |
|------|---------|------|
| Service | 1 核 | 主要业务逻辑 |
| Web | 0.5 核 | 前台网站 |
| Admin | 0.5 核 | 管理后台 |
| Nginx | 0.25 核 | 反向代理 |
| PostgreSQL/Redis | 共享剩余 | 数据库服务 |

## 🔧 主要优化调整

### 1. PostgreSQL 优化

**调整前（适合 4G+ 内存）：**
- shared_buffers=256MB
- effective_cache_size=1GB
- max_wal_size=4GB

**调整后（适合 2G 内存）：**
- shared_buffers=128MB ✅
- effective_cache_size=512MB ✅
- max_wal_size=1GB ✅
- max_connections=100（从200减少）✅
- work_mem=2MB（从4MB减少）✅

### 2. Redis 优化

**调整前：**
- maxmemory=512MB

**调整后：**
- maxmemory=256MB ✅

### 3. 服务资源限制优化

**调整前：**
- Service: 2G 内存限制
- Web: 1G 内存限制
- Admin: 1G 内存限制
- 总计：4G+（超出服务器容量）

**调整后：**
- Service: 512MB 内存限制 ✅
- Web: 512MB 内存限制 ✅
- Admin: 512MB 内存限制 ✅
- Nginx: 128MB 内存限制 ✅
- 总计：~1.8GB（合理分配）

### 4. Nginx 优化

**调整前：**
- worker_connections=2048

**调整后：**
- worker_connections=1024 ✅

## ⚠️ 注意事项

### 1. 内存监控

由于内存资源紧张，建议：

```bash
# 定期检查内存使用
./scripts/monitor.sh stats

# 或使用系统命令
free -h
docker stats --no-stream
```

### 2. 性能建议

- **启用 Redis 缓存**：减少数据库查询
- **使用 CDN**：减轻服务器负担
- **定期清理日志**：避免磁盘空间不足
- **监控磁盘使用**：40GB 磁盘需要合理管理

### 3. 扩展建议

如果访问量增加，建议：

1. **升级到 4核4G**：更好的性能表现
2. **使用 RDS**：将数据库迁移到阿里云 RDS
3. **使用 Redis 云服务**：使用阿里云 Redis
4. **启用 OSS**：将静态文件存储到对象存储

## 📈 性能调优建议

### 1. 数据库连接池

在应用代码中限制数据库连接数：

```typescript
// service/src/config/database.config.ts
maxConnections: 10  // 减少连接数
```

### 2. 缓存策略

- 启用 Redis 缓存热点数据
- 设置合理的缓存过期时间
- 使用 CDN 缓存静态资源

### 3. 日志管理

```bash
# 配置日志轮转，避免日志文件过大
# 在 docker-compose.prod.yml 中已配置：
# max-size: '10m'
# max-file: '3'
```

### 4. 定期维护

```bash
# 每周清理 Docker 未使用的资源
docker system prune -f

# 定期清理旧备份（保留最近7天）
find backups -name "*.gz" -mtime +7 -delete
```

## 🔍 监控指标

建议监控以下指标：

1. **内存使用率**：应保持在 80% 以下
2. **CPU 使用率**：应保持在 70% 以下
3. **磁盘使用率**：应保持在 80% 以下
4. **数据库连接数**：应保持在 max_connections 的 80% 以下

## 🆘 故障处理

### 内存不足

如果出现 OOM（Out of Memory）错误：

```bash
# 1. 检查内存使用
docker stats

# 2. 重启服务
docker-compose restart

# 3. 如果持续出现，考虑：
# - 减少某个服务的资源限制
# - 升级服务器配置
```

### 磁盘空间不足

```bash
# 1. 检查磁盘使用
df -h

# 2. 清理 Docker 资源
docker system prune -a -f

# 3. 清理旧日志和备份
find service/logs -name "*.log" -mtime +7 -delete
find backups -name "*.gz" -mtime +30 -delete
```

## 📝 配置验证

部署后验证配置：

```bash
# 检查服务状态
./scripts/monitor.sh status

# 检查资源使用
./scripts/monitor.sh stats

# 健康检查
./scripts/monitor.sh health
```

---

**最后更新**: 2024-01-01

