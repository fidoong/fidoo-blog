# 使用 PM2 部署（不使用 Docker）

如果服务器上已经有 Node.js 和 pnpm，可以使用 PM2 直接部署，无需 Docker。

## 前置要求

- Node.js >= 18.0.0
- pnpm >= 10.0.0
- PostgreSQL（可以 Docker 运行，或直接安装）
- Redis（可以 Docker 运行，或直接安装）
- PM2

## 快速部署步骤

### 步骤 1: 安装依赖

```bash
cd /opt/fidoo-blog

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

### 步骤 2: 安装 PostgreSQL 和 Redis（如果还没有）

#### 选项 A: 使用 Docker 运行数据库（推荐，简单）

```bash
# 只运行数据库和 Redis
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=C6smYzpjKKUVlr1xHrECiJbaqMitM0QV \
  -e POSTGRES_DB=fidoo_blog \
  -p 127.0.0.1:5432:5432 \
  postgres:15-alpine

docker run -d \
  --name redis \
  -p 127.0.0.1:6379:6379 \
  redis:7-alpine redis-server --requirepass y05lFupXH5jquE5s3ZXCnQi7PEun0W9x
```

#### 选项 B: 直接安装（更稳定）

```bash
# 安装 PostgreSQL
apt update
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 创建数据库
sudo -u postgres psql << EOF
CREATE DATABASE fidoo_blog;
CREATE USER fidoo_user WITH PASSWORD 'C6smYzpjKKUVlr1xHrECiJbaqMitM0QV';
GRANT ALL PRIVILEGES ON DATABASE fidoo_blog TO fidoo_user;
\q
EOF

# 安装 Redis
apt install -y redis-server
systemctl start redis
systemctl enable redis
```

### 步骤 3: 配置环境变量

```bash
cd /opt/fidoo-blog

# 创建生产环境配置
cat > service/.env.production << 'EOF'
NODE_ENV=production
PORT=3005
APP_URL=http://120.55.3.205:3005
CORS_ORIGIN=http://120.55.3.205:3000,http://120.55.3.205:3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=C6smYzpjKKUVlr1xHrECiJbaqMitM0QV
DB_DATABASE=fidoo_blog
DB_SYNCHRONIZE=false
DB_LOGGING=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=y05lFupXH5jquE5s3ZXCnQi7PEun0W9x
REDIS_DB=0
JWT_SECRET=WK3aX0sFWQCsE0nzRW9kAxbU7gTd1sw0RpnHJFRdmDo=
JWT_EXPIRES_IN=7d
EOF

# 配置前端 API 地址
export NEXT_PUBLIC_API_URL=http://120.55.3.205:3005/api/v1
```

### 步骤 4: 安装 PM2

```bash
npm install -g pm2
```

### 步骤 5: 启动服务

```bash
cd /opt/fidoo-blog

# 使用 PM2 启动所有服务
pm2 start deploy/ecosystem.config.js

# 或者分别启动
cd service
pm2 start dist/main.js --name fidoo-blog-service
cd ../web
pm2 start npm --name fidoo-blog-web -- start
cd ../admin
pm2 start npm --name fidoo-blog-admin -- start
cd ..

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 执行上面命令输出的命令
```

### 步骤 6: 运行数据库迁移

```bash
cd /opt/fidoo-blog/service
pnpm migration:run

# 可选：初始化数据
pnpm seed
```

### 步骤 7: 验证部署

```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs

# 测试服务
curl http://localhost:3005/health
curl http://localhost:3000
curl http://localhost:3001
```

## 常用 PM2 命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs
pm2 logs fidoo-blog-service

# 重启服务
pm2 restart all
pm2 restart fidoo-blog-service

# 停止服务
pm2 stop all
pm2 stop fidoo-blog-service

# 删除服务
pm2 delete all
pm2 delete fidoo-blog-service

# 查看监控
pm2 monit
```

## 更新部署

```bash
cd /opt/fidoo-blog

# 拉取最新代码
git pull

# 安装依赖
pnpm install

# 重新构建
pnpm build

# 重启服务
pm2 restart all

# 运行数据库迁移（如有）
cd service
pnpm migration:run
```

## 优势

- ✅ 不需要 Docker，更轻量
- ✅ 直接使用系统 Node.js，性能更好
- ✅ 更容易调试和排查问题
- ✅ 资源占用更少

## 注意事项

- 需要手动管理数据库和 Redis
- 需要配置进程守护（PM2 已处理）
- 需要配置日志轮转（PM2 已处理）

