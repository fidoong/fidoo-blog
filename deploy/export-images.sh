#!/bin/bash

# 在本地机器上导出 Docker 镜像脚本

set -e

echo "📦 导出 Docker 镜像..."
echo ""

# 需要导出的镜像列表
IMAGES=(
    "node:20-alpine"
    "postgres:14-alpine"
    "redis:6-alpine"
)

EXPORT_DIR="./docker-images"
mkdir -p "$EXPORT_DIR"

echo "🔍 检查本地镜像..."
echo ""

# 检查并导出镜像
for image in "${IMAGES[@]}"; do
    if docker images | grep -q "$image"; then
        echo "✅ 找到镜像: $image"
        FILENAME=$(echo "$image" | tr '/:' '_')
        echo "📤 导出到: $EXPORT_DIR/${FILENAME}.tar.gz"
        docker save "$image" | gzip > "$EXPORT_DIR/${FILENAME}.tar.gz"
        echo "✅ 导出完成"
        echo ""
    else
        echo "⚠️  镜像不存在: $image"
        echo "   尝试拉取..."
        if docker pull "$image" 2>/dev/null; then
            FILENAME=$(echo "$image" | tr '/:' '_')
            echo "📤 导出到: $EXPORT_DIR/${FILENAME}.tar.gz"
            docker save "$image" | gzip > "$EXPORT_DIR/${FILENAME}.tar.gz"
            echo "✅ 导出完成"
        else
            echo "❌ 无法拉取: $image"
        fi
        echo ""
    fi
done

echo "📊 导出统计："
ls -lh "$EXPORT_DIR"/*.tar.gz 2>/dev/null | awk '{print $5, $9}' || echo "没有导出文件"

echo ""
echo "✅ 导出完成！"
echo ""
echo "📝 下一步："
echo "1. 将 $EXPORT_DIR 目录上传到服务器"
echo "2. 在服务器上运行 ./deploy/import-images.sh"
echo ""
echo "上传命令示例："
echo "  scp -r $EXPORT_DIR root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/"
echo "  或者使用 rsync:"
echo "  rsync -avz $EXPORT_DIR/ root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/docker-images/"
echo ""

