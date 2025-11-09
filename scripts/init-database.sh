#!/bin/bash

# 数据库初始化脚本
# 包括：运行迁移 + 生成测试数据

echo "🗄️  数据库初始化脚本"
echo ""

# 检查服务是否运行
echo "📦 检查服务状态..."
if ! docker ps | grep -q fidoo-blog-postgres-dev; then
  echo "❌ PostgreSQL 容器未运行"
  echo "💡 请先运行: pnpm start:services"
  exit 1
fi

echo "✅ PostgreSQL 容器正在运行"
echo ""

# 进入 service 目录
cd service || exit 1

# 步骤 1: 运行数据库迁移
echo "📋 步骤 1: 运行数据库迁移..."
pnpm migration:run

if [ $? -ne 0 ]; then
  echo "❌ 数据库迁移失败"
  exit 1
fi

echo "✅ 数据库迁移完成"
echo ""

# 步骤 2: 生成测试数据
echo "🌱 步骤 2: 生成测试数据..."
echo ""
echo "请选择要生成的数据类型:"
echo "  1) 基础测试数据 (推荐) - 5个用户, 6个分类, 20个标签, 8篇文章"
echo "  2) 大量测试数据 - 150个用户, 1000篇文章 (用于性能测试)"
echo ""
read -p "请输入选项 (1 或 2，默认 1): " choice

choice=${choice:-1}

if [ "$choice" = "1" ]; then
  echo "正在生成基础测试数据..."
  pnpm seed
elif [ "$choice" = "2" ]; then
  echo "正在生成大量测试数据（可能需要几分钟）..."
  pnpm seed:large
else
  echo "❌ 无效选项，使用默认选项 1"
  pnpm seed
fi

if [ $? -ne 0 ]; then
  echo "❌ 生成测试数据失败"
  exit 1
fi

echo ""
echo "🎉 数据库初始化完成！"
echo ""
echo "📝 测试账号信息:"
echo "  管理员:"
echo "    - 用户名: admin"
echo "    - 密码: 123456"
echo "  编辑:"
echo "    - 用户名: editor"
echo "    - 密码: 123456"
echo "  普通用户:"
echo "    - 用户名: zhangsan / lisi / wangwu"
echo "    - 密码: 123456"
echo ""

