#!/bin/bash

# 启动开发环境所需服务的脚本

echo "🚀 启动开发环境服务..."
echo ""

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
  echo "❌ Docker daemon 未运行"
  echo ""
  echo "请先启动 Docker Desktop:"
  echo "  1. 打开 Docker Desktop 应用"
  echo "  2. 等待 Docker 完全启动"
  echo "  3. 然后重新运行此脚本"
  echo ""
  echo "或者使用以下命令启动 Docker (如果已安装):"
  echo "  open -a Docker"
  exit 1
fi

echo "✅ Docker 正在运行"
echo ""

# 启动开发服务（只启动 Redis 和 PostgreSQL）
echo "📦 启动 Redis 和 PostgreSQL..."
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "⏳ 等待服务就绪..."

# 等待 PostgreSQL 就绪
echo -n "等待 PostgreSQL..."
until docker exec fidoo-blog-postgres-dev pg_isready -U postgres &> /dev/null; do
  echo -n "."
  sleep 1
done
echo " ✅"

# 等待 Redis 就绪
echo -n "等待 Redis..."
until docker exec fidoo-blog-redis-dev redis-cli ping &> /dev/null; do
  echo -n "."
  sleep 1
done
echo " ✅"

echo ""
echo "🎉 所有服务已启动！"
echo ""
echo "服务信息:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "停止服务: pnpm docker:dev:down"

