#!/bin/bash
# 在服务器上直接执行的命令序列
# 复制这些命令到服务器上执行

set -e

echo "🚀 开始部署 Fidoo Blog..."

# 1. 检查当前目录
pwd
ls -la

# 2. 安装 Docker（如果还没有）
if ! command -v docker &> /dev/null; then
    echo "📦 安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

# 3. 安装 Docker Compose（如果还没有）
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 4. 获取公网 IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ip.sb)
echo "📍 服务器 IP: $SERVER_IP"

# 5. 配置 IP（如果 scripts/config-ip.sh 存在）
if [ -f "scripts/config-ip.sh" ]; then
    chmod +x scripts/config-ip.sh
    ./scripts/config-ip.sh $SERVER_IP
else
    echo "⚠️  配置脚本不存在，需要手动配置 IP"
    echo "请编辑 service/.env.production 和 deploy/docker-compose.prod.yml"
    echo "将 YOUR_SERVER_IP 替换为: $SERVER_IP"
fi

# 6. 配置防火墙
echo "🔥 配置防火墙..."
ufw allow 3000/tcp 2>/dev/null || true
ufw allow 3001/tcp 2>/dev/null || true
ufw allow 3005/tcp 2>/dev/null || true
ufw --force enable 2>/dev/null || true

# 7. 部署服务
echo "🚀 部署服务..."
if [ -f "deploy/docker-compose.prod.yml" ]; then
    docker-compose -f deploy/docker-compose.prod.yml build
    docker-compose -f deploy/docker-compose.prod.yml up -d
else
    echo "❌ 找不到 deploy/docker-compose.prod.yml"
    echo "请确保项目文件完整"
    exit 1
fi

# 8. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 9. 检查服务状态
docker-compose -f deploy/docker-compose.prod.yml ps

# 10. 运行数据库迁移
echo "🗄️  运行数据库迁移..."
docker-compose -f deploy/docker-compose.prod.yml exec -T service sh -c "cd /app/service && pnpm migration:run" 2>/dev/null || echo "⚠️  迁移可能已运行"

echo ""
echo "✅ 部署完成！"
echo "访问地址: http://$SERVER_IP:3000"
