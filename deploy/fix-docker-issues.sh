#!/bin/bash
# 修复 Docker 部署问题：Dockerfile 路径和镜像加速

set -e

echo "🔧 修复 Docker 部署问题..."

cd /opt/fidoo-blog

# 1. 检查 Dockerfile 位置
echo "检查 Dockerfile 文件..."
if [ -f "Dockerfile.service" ]; then
    echo "✅ Dockerfile.service 在根目录"
elif [ -f "service/Dockerfile" ]; then
    echo "⚠️  Dockerfile 在 service 目录，需要调整配置"
else
    echo "❌ 找不到 Dockerfile"
    echo "当前目录的 Dockerfile:"
    ls -la Dockerfile* 2>/dev/null || echo "没有找到"
fi

# 2. 配置 Docker 镜像加速器（解决拉取超时）
echo ""
echo "配置 Docker 镜像加速器..."

# 创建或更新 daemon.json
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF

# 重启 Docker 服务
systemctl daemon-reload
systemctl restart docker

echo "✅ Docker 镜像加速器已配置"

# 3. 验证配置
echo ""
echo "验证 Docker 配置..."
docker info | grep -A 10 "Registry Mirrors"

echo ""
echo "✅ 配置完成！现在可以重新尝试构建："
echo "docker-compose -f deploy/docker-compose.prod.yml build"

