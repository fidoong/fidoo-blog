# 服务器手动部署命令

如果 `deploy/quick-deploy.sh` 不存在，请直接在服务器上执行以下命令：

## 📋 快速检查

```bash
# 检查当前目录结构
pwd
ls -la

# 检查是否有 deploy 目录
ls -la deploy/ 2>/dev/null || echo "deploy 目录不存在"

# 检查是否有 docker-compose 文件
ls -la docker-compose*.yml deploy/docker-compose*.yml 2>/dev/null || echo "docker-compose 文件不存在"
```

## 🚀 手动部署步骤

### 步骤 1: 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl start docker
systemctl enable docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证
docker --version
docker-compose --version
```

### 步骤 2: 获取服务器 IP

```bash
SERVER_IP=$(curl -s ifconfig.me)
echo "服务器 IP: $SERVER_IP"
```

### 步骤 3: 配置环境变量

```bash
# 如果 service/.env.production 存在，编辑它
if [ -f "service/.env.production" ]; then
    # 替换 IP
    sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" service/.env.production
    sed -i "s/your-domain.com/$SERVER_IP/g" service/.env.production
    sed -i "s|https://|http://|g" service/.env.production
    echo "✅ 已更新 service/.env.production"
else
    echo "⚠️  service/.env.production 不存在，需要手动创建"
fi
```

### 步骤 4: 配置 Docker Compose（如果文件存在）

```bash
# 如果 deploy/docker-compose.prod.yml 存在
if [ -f "deploy/docker-compose.prod.yml" ]; then
    sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" deploy/docker-compose.prod.yml
    sed -i "s|https://|http://|g" deploy/docker-compose.prod.yml
    echo "✅ 已更新 deploy/docker-compose.prod.yml"
fi
```

### 步骤 5: 配置防火墙

```bash
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw allow 3005/tcp
ufw --force enable
```

### 步骤 6: 部署服务

```bash
# 方式一：如果有 deploy/docker-compose.prod.yml
if [ -f "deploy/docker-compose.prod.yml" ]; then
    docker-compose -f deploy/docker-compose.prod.yml build
    docker-compose -f deploy/docker-compose.prod.yml up -d
# 方式二：如果有根目录的 docker-compose.yml
elif [ -f "docker-compose.yml" ]; then
    docker-compose build
    docker-compose up -d
else
    echo "❌ 找不到 docker-compose 配置文件"
    exit 1
fi
```

### 步骤 7: 等待并检查

```bash
# 等待服务启动
sleep 30

# 查看服务状态
docker-compose -f deploy/docker-compose.prod.yml ps || docker-compose ps

# 查看日志
docker-compose -f deploy/docker-compose.prod.yml logs -f || docker-compose logs -f
```

### 步骤 8: 运行数据库迁移

```bash
# 运行迁移
docker-compose -f deploy/docker-compose.prod.yml exec service sh -c "cd /app/service && pnpm migration:run" || \
docker-compose exec service sh -c "cd /app/service && pnpm migration:run" || \
echo "⚠️  请手动运行数据库迁移"
```

## 🔧 如果文件不完整

如果项目文件不完整，可以：

### 选项 1: 从 Git 克隆完整项目

```bash
cd /opt
rm -rf fidoo-blog  # 如果存在但不完整
git clone https://github.com/your-username/fidoo-blog.git
cd fidoo-blog
```

### 选项 2: 从本地重新上传

在本地电脑执行：
```bash
cd /Users/fidoo/Desktop/github/fidoo-blog
tar -czf fidoo-blog.tar.gz --exclude='node_modules' --exclude='.next' --exclude='dist' --exclude='.git' .
scp fidoo-blog.tar.gz root@your-server-ip:/root/
```

在服务器上执行：
```bash
cd /root
tar -xzf fidoo-blog.tar.gz -C fidoo-blog
cd fidoo-blog
```

## 📝 最小化部署（如果只有基本文件）

如果只有基本的 Dockerfile，可以手动创建 docker-compose.yml：

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: C6smYzpjKKUVlr1xHrECiJbaqMitM0QV
      POSTGRES_DB: fidoo_blog
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass y05lFupXH5jquE5s3ZXCnQi7PEun0W9x
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"

  service:
    build:
      context: .
      dockerfile: Dockerfile.service
    environment:
      DB_HOST: postgres
      DB_PASSWORD: C6smYzpjKKUVlr1xHrECiJbaqMitM0QV
      REDIS_HOST: redis
      REDIS_PASSWORD: y05lFupXH5jquE5s3ZXCnQi7PEun0W9x
      JWT_SECRET: WK3aX0sFWQCsE0nzRW9kAxbU7gTd1sw0RpnHJFRdmDo=
    ports:
      - "3005:3005"
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3000:3000"
    depends_on:
      - service

  admin:
    build:
      context: .
      dockerfile: Dockerfile.admin
    ports:
      - "3001:3001"
    depends_on:
      - service

volumes:
  postgres_data:
  redis_data:
EOF
```

然后执行：
```bash
docker-compose build
docker-compose up -d
```

