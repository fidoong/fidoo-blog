#!/bin/bash

# 在服务器上导入 Docker 镜像脚本

set -e

echo "📥 导入 Docker 镜像..."
echo ""

IMAGES_DIR="./docker-images"

if [ ! -d "$IMAGES_DIR" ]; then
    echo "❌ 镜像目录不存在: $IMAGES_DIR"
    echo ""
    echo "请先上传镜像文件到服务器："
    echo "  scp -r docker-images root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/"
    echo "  或者使用 rsync:"
    echo "  rsync -avz docker-images/ root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/docker-images/"
    exit 1
fi

echo "🔍 查找镜像文件..."
echo ""

# 导入所有 .tar.gz 文件
IMPORTED=0
FAILED=0

for file in "$IMAGES_DIR"/*.tar.gz; do
    if [ -f "$file" ]; then
        FILENAME=$(basename "$file")
        echo "📥 导入: $FILENAME"

        if gunzip -c "$file" | docker load; then
            echo "✅ 导入成功: $FILENAME"
            ((IMPORTED++))
        else
            echo "❌ 导入失败: $FILENAME"
            ((FAILED++))
        fi
        echo ""
    fi
done

echo "📊 导入统计："
echo "  ✅ 成功: $IMPORTED"
echo "  ❌ 失败: $FAILED"
echo ""

if [ $IMPORTED -gt 0 ]; then
    echo "✅ 导入完成！"
    echo ""
    echo "📋 已导入的镜像："
    docker images | grep -E "node|postgres|redis" | head -10
    echo ""
    echo "🎯 下一步："
    echo "1. 根据导入的镜像更新 Dockerfile（如果需要）"
    echo "2. 运行构建："
    echo "   docker-compose -f deploy/docker-compose.prod.yml build"
    echo "3. 启动服务："
    echo "   docker-compose -f deploy/docker-compose.prod.yml up -d"
else
    echo "❌ 没有成功导入任何镜像"
    exit 1
fi

