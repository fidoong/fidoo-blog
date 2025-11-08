#!/bin/bash

echo "🚀 Fidoo Blog 项目初始化脚本"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js (>= 18.0.0)"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 正在安装 pnpm..."
    npm install -g pnpm
fi

echo "✓ pnpm 版本: $(pnpm -v)"

# 安装依赖
echo ""
echo "📦 正在安装项目依赖..."
pnpm install

# 检查 Docker
if command -v docker &> /dev/null; then
    echo "✓ Docker 版本: $(docker -v)"
    
    # 询问是否启动数据库
    read -p "是否使用 Docker 启动数据库服务? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🐳 正在启动数据库服务..."
        docker-compose up -d postgres redis
        echo "✓ 数据库服务已启动"
    fi
else
    echo "⚠️  未检测到 Docker，请手动配置 PostgreSQL 和 Redis"
fi

# 配置环境变量
if [ ! -f "service/.env" ]; then
    echo ""
    echo "📝 正在配置环境变量..."
    cp service/env.example service/.env
    echo "✓ 环境变量文件已创建: service/.env"
    echo "⚠️  请编辑 service/.env 文件配置您的环境变量"
fi

# 安装 Git hooks
if [ -d ".git" ]; then
    echo ""
    echo "🔗 正在安装 Git hooks..."
    npx husky install
    echo "✓ Git hooks 已安装"
fi

echo ""
echo "✨ 初始化完成！"
echo ""
echo "下一步操作："
echo "1. 编辑 service/.env 文件配置环境变量"
echo "2. 运行 'cd service && pnpm migration:run' 初始化数据库"
echo "3. 运行 'pnpm service:dev' 启动后端服务"
echo "4. 运行 'pnpm web:dev' 启动前台网站"
echo "5. 运行 'pnpm admin:dev' 启动后台管理"
echo ""
echo "访问地址："
echo "- API 文档: http://localhost:3000/api/docs"
echo "- 前台网站: http://localhost:3001"
echo "- 后台管理: http://localhost:3002"
echo ""
echo "祝您开发愉快！ 🎉"

