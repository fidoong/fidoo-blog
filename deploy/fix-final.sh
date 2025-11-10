#!/bin/bash
# 最终修复方案：配置镜像加速器 + 使用官方镜像名称

cd /opt/fidoo-blog

echo "🔧 最终修复方案..."

# 1. 恢复为官方镜像名称
echo "恢复为官方镜像名称..."
sed -i 's|dockerhub.azk8s.cn/library/||g' deploy/docker-compose.prod.yml
sed -i 's|dockerhub.azk8s.cn/library/||g' Dockerfile.service Dockerfile.web Dockerfile.admin

# 2. 配置 Docker 镜像加速器（使用多个源）
echo "配置 Docker 镜像加速器..."
systemctl stop docker
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ],
  "max-concurrent-downloads": 10
}
EOF

systemctl daemon-reload
systemctl start docker
sleep 10

# 3. 验证配置
echo "验证镜像加速器..."
docker info | grep -A 5 "Registry Mirrors"

# 4. 测试拉取
echo "测试拉取镜像..."
timeout 120 docker pull postgres:15-alpine && echo "✅ postgres 镜像拉取成功" || echo "⚠️  postgres 镜像拉取失败"
timeout 120 docker pull redis:7-alpine && echo "✅ redis 镜像拉取成功" || echo "⚠️  redis 镜像拉取失败"
timeout 120 docker pull node:18-alpine && echo "✅ node 镜像拉取成功" || echo "⚠️  node 镜像拉取失败"

echo ""
echo "✅ 配置完成！现在可以构建："
echo "docker-compose -f deploy/docker-compose.prod.yml build"
