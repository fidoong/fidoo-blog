#!/bin/bash
# 阿里云 ECS 一键部署脚本

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Fidoo Blog 一键部署脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 获取公网 IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ip.sb)
echo "📍 检测到服务器 IP: $SERVER_IP"
echo ""

# 1. 安装 Docker
if ! command -v docker &> /dev/null; then
    echo "📦 安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装"
fi

# 2. 安装 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安装完成"
else
    echo "✅ Docker Compose 已安装"
fi

# 3. 克隆项目
if [ ! -d "/opt/fidoo-blog" ]; then
    echo "📥 克隆项目..."
    cd /opt
    read -p "请输入 Git 仓库地址 (直接回车跳过，稍后手动克隆): " GIT_REPO
    if [ -n "$GIT_REPO" ]; then
        git clone $GIT_REPO fidoo-blog
        echo "✅ 项目克隆完成"
    else
        echo "⚠️  请稍后手动克隆项目到 /opt/fidoo-blog"
        exit 1
    fi
fi

# 4. 进入项目目录
cd /opt/fidoo-blog

# 5. 配置 IP
echo "🔧 配置 IP 地址..."
chmod +x scripts/*.sh 2>/dev/null || true
if [ -f "scripts/config-ip.sh" ]; then
    ./scripts/config-ip.sh $SERVER_IP
else
    echo "⚠️  配置脚本不存在，请手动配置 IP"
fi

# 6. 配置防火墙
echo "🔥 配置防火墙..."
ufw allow 3000/tcp 2>/dev/null || true
ufw allow 3001/tcp 2>/dev/null || true
ufw allow 3005/tcp 2>/dev/null || true
ufw --force enable 2>/dev/null || true
echo "✅ 防火墙配置完成"

# 7. 部署服务
echo "🚀 开始部署服务..."
if [ -f "scripts/deploy.sh" ]; then
    ./scripts/deploy.sh docker production
else
    docker-compose -f deploy/docker-compose.prod.yml build
    docker-compose -f deploy/docker-compose.prod.yml up -d
fi

# 8. 等待服务启动
echo "⏳ 等待服务启动（30秒）..."
sleep 30

# 9. 运行数据库迁移
echo "🗄️  运行数据库迁移..."
docker-compose -f deploy/docker-compose.prod.yml exec -T service sh -c "cd /app/service && pnpm migration:run" 2>/dev/null || echo "⚠️  数据库迁移可能已运行或失败，请手动检查"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  前台网站:  http://$SERVER_IP:3000"
echo "  后台管理:  http://$SERVER_IP:3001"
echo "  后端 API:  http://$SERVER_IP:3005/api"
echo "  API 文档:  http://$SERVER_IP:3005/api/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 常用命令："
echo "  查看状态: docker-compose -f deploy/docker-compose.prod.yml ps"
echo "  查看日志: docker-compose -f deploy/docker-compose.prod.yml logs -f"
echo "  重启服务: docker-compose -f deploy/docker-compose.prod.yml restart"
