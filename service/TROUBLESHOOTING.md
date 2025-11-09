# 故障排查指南

## 常见启动错误

### 1. JwtModule 初始化错误

**错误现象:**
```
[Nest] ERROR [ExceptionHandler] 
```

**可能原因:**
- JWT Secret 配置缺失或为空
- Redis 连接失败（JwtModule 依赖其他模块）
- 数据库连接失败

**解决方案:**

1. **检查环境变量**
   ```bash
   # 确保 .env 文件存在且包含以下配置
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRATION=7d
   ```

2. **检查 Redis 服务**
   ```bash
   # 检查 Redis 是否运行
   redis-cli ping
   # 应该返回: PONG
   
   # 如果未运行，启动 Redis
   redis-server
   # 或使用 Docker
   docker run -d -p 6379:6379 redis
   ```

3. **检查数据库连接**
   ```bash
   # 检查 PostgreSQL 是否运行
   pg_isready
   
   # 如果未运行，启动 PostgreSQL
   # macOS
   brew services start postgresql
   # Linux
   sudo systemctl start postgresql
   # 或使用 Docker
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
   ```

### 2. Redis 连接错误

**错误信息:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**解决方案:**
1. 确保 Redis 服务已启动
2. 检查 Redis 配置（host, port, password）
3. 如果使用 Docker，确保容器正在运行

### 3. 数据库连接错误

**错误信息:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案:**
1. 确保 PostgreSQL 服务已启动
2. 检查数据库配置（host, port, username, password, database）
3. 确保数据库已创建
4. 检查数据库用户权限

### 4. 模块依赖循环

**错误信息:**
```
Nest can't resolve dependencies of the ...
```

**解决方案:**
1. 检查模块导入顺序
2. 确保所有依赖的模块都已正确导入
3. 检查 providers 是否正确导出

## 诊断步骤

### 步骤 1: 检查环境变量

```bash
# 在 service 目录下
cat .env.local
# 或
cat .env
```

确保以下关键配置存在：
- `JWT_SECRET`
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `REDIS_HOST`, `REDIS_PORT`

### 步骤 2: 检查服务状态

```bash
# 检查 Redis
redis-cli ping

# 检查 PostgreSQL
pg_isready

# 检查端口占用
lsof -i :3005  # 应用端口
lsof -i :6379  # Redis 端口
lsof -i :5432  # PostgreSQL 端口
```

### 步骤 3: 查看详细日志

启动应用时，现在会输出更详细的错误信息：
- 连接错误会提示具体服务
- JWT 配置错误会提示检查配置
- 完整的错误堆栈信息

### 步骤 4: 使用 Docker Compose

如果本地环境配置复杂，可以使用 Docker Compose：

```bash
# 在项目根目录
docker-compose up -d
```

这会自动启动 Redis 和 PostgreSQL。

## 快速修复命令

```bash
# 1. 启动 Redis
redis-server
# 或
docker run -d -p 6379:6379 redis

# 2. 启动 PostgreSQL
# macOS
brew services start postgresql
# Linux
sudo systemctl start postgresql
# 或
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres

# 3. 创建数据库
psql -U postgres -c "CREATE DATABASE fidoo_blog;"

# 4. 运行数据库迁移
cd service
npm run migration:run
```

## 获取帮助

如果问题仍然存在：
1. 查看完整的错误堆栈信息
2. 检查服务日志文件: `service/logs/error.log`
3. 确认所有依赖服务都在运行
4. 验证环境变量配置正确

