#!/bin/bash

# 检查服务状态的脚本

echo "🔍 检查服务状态..."
echo ""

# 检查 Redis
echo "📦 Redis (端口 6379):"
if command -v redis-cli &> /dev/null; then
  if redis-cli ping &> /dev/null; then
    echo "   ✅ Redis 正在运行"
  else
    echo "   ❌ Redis 未运行"
    echo "   💡 启动命令: redis-server 或 docker run -d -p 6379:6379 redis"
  fi
else
  echo "   ⚠️  redis-cli 未安装"
fi

echo ""

# 检查 PostgreSQL
echo "🐘 PostgreSQL (端口 5432):"
if command -v pg_isready &> /dev/null; then
  if pg_isready &> /dev/null; then
    echo "   ✅ PostgreSQL 正在运行"
  else
    echo "   ❌ PostgreSQL 未运行"
    echo "   💡 启动命令: brew services start postgresql 或 docker run -d -p 5432:5432 postgres"
  fi
else
  echo "   ⚠️  pg_isready 未安装"
fi

echo ""

# 检查端口占用
echo "🔌 端口占用情况:"
if command -v lsof &> /dev/null; then
  echo "   端口 6379 (Redis):"
  if lsof -i :6379 &> /dev/null; then
    lsof -i :6379 | grep LISTEN
  else
    echo "   ⚠️  端口 6379 未被占用"
  fi
  
  echo "   端口 5432 (PostgreSQL):"
  if lsof -i :5432 &> /dev/null; then
    lsof -i :5432 | grep LISTEN
  else
    echo "   ⚠️  端口 5432 未被占用"
  fi
  
  echo "   端口 3005 (Service):"
  if lsof -i :3005 &> /dev/null; then
    lsof -i :3005 | grep LISTEN
  else
    echo "   ⚠️  端口 3005 未被占用"
  fi
else
  echo "   ⚠️  lsof 未安装，无法检查端口"
fi

echo ""
echo "✅ 检查完成"

