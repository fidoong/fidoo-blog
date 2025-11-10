#!/bin/bash
# 修复 Docker 镜像拉取超时问题

set -e

echo "🔧 配置 Docker 镜像加速器..."

# 1. 停止 Docker
echo "停止 Docker 服务..."
systemctl stop docker

# 2. 配置镜像加速器
echo "配置镜像加速器..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://dockerhub.azk8s.cn"
  ],
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5
}
EOF

# 3. 重启 Docker
echo "重启 Docker 服务..."
systemctl daemon-reload
systemctl start docker

# 4. 等待 Docker 完全启动
echo "等待 Docker 启动..."
sleep 10

# 5. 验证配置
echo ""
echo "验证镜像加速器配置..."
if docker info | grep -q "Registry Mirrors"; then
    echo "✅ 镜像加速器配置成功："
    docker info | grep -A 10 "Registry Mirrors"
else
    echo "⚠️  配置可能未生效，检查配置..."
    cat /etc/docker/daemon.json
fi

# 6. 测试拉取镜像
echo ""
echo "测试拉取镜像（postgres:15-alpine）..."
docker pull postgres:15-alpine || echo "⚠️  拉取失败，但可以继续尝试构建"

echo ""
echo "✅ 配置完成！现在可以重新构建："
echo "docker-compose -f deploy/docker-compose.prod.yml build"
