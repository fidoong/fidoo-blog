#!/bin/bash
# 单独启动数据库和 Redis（不通过 docker-compose）

echo "🚀 启动数据库和 Redis..."

# 1. 启动 PostgreSQL
echo "启动 PostgreSQL..."
docker run -d \
  --name fidoo-blog-postgres-prod \
  --restart unless-stopped \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=C6smYzpjKKUVlr1xHrECiJbaqMitM0QV \
  -e POSTGRES_DB=fidoo_blog \
  -p 127.0.0.1:5432:5432 \
  -v postgres_prod_data:/var/lib/postgresql/data \
  postgres:15-alpine || echo "PostgreSQL 可能已存在"

# 2. 启动 Redis
echo "启动 Redis..."
docker run -d \
  --name fidoo-blog-redis-prod \
  --restart unless-stopped \
  -p 127.0.0.1:6379:6379 \
  -v redis_prod_data:/data \
  redis:7-alpine redis-server --requirepass y05lFupXH5jquE5s3ZXCnQi7PEun0W9x || echo "Redis 可能已存在"

# 3. 等待启动
echo "等待服务启动..."
sleep 10

# 4. 检查状态
echo ""
echo "检查服务状态..."
docker ps | grep -E "postgres|redis"

echo ""
echo "✅ 数据库和 Redis 已启动"
echo "现在可以只构建应用服务："
echo "docker-compose -f deploy/docker-compose.prod.yml build service web admin"
echo "docker-compose -f deploy/docker-compose.prod.yml up -d service web admin"
