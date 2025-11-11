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

    # 检查并打标签（确保标签匹配 Dockerfile 需要的）
    echo "🔍 检查镜像标签..."
    echo ""

    # 检查 node 镜像
    if docker images | grep -q "node.*latest"; then
        if ! docker images | grep -q "node.*20-alpine"; then
            echo "📝 为 node:latest 打标签 node:20-alpine"
            docker tag node:latest node:20-alpine
            echo "✅ 标签已创建"
        fi
    fi

    # 检查 postgres 镜像
    if docker images | grep -q "postgres.*latest"; then
        if ! docker images | grep -q "postgres.*14-alpine"; then
            echo "📝 为 postgres:latest 打标签 postgres:14-alpine"
            docker tag postgres:latest postgres:14-alpine
            echo "✅ 标签已创建"
        fi
    fi

    # 检查 redis 镜像
    if docker images | grep -q "redis.*latest"; then
        if ! docker images | grep -q "redis.*6-alpine"; then
            echo "📝 为 redis:latest 打标签 redis:6-alpine"
            docker tag redis:latest redis:6-alpine
            echo "✅ 标签已创建"
        fi
    fi

    echo ""
    echo "📋 最终镜像列表："
    docker images | grep -E "node|postgres|redis" | head -10
    echo ""
    echo "🎯 下一步："
    echo "1. 运行构建："
    echo "   ./deploy/build-docker.sh"
    echo "   或"
    echo "   docker-compose -f deploy/docker-compose.prod.yml build"
    echo "2. 启动服务："
    echo "   docker-compose -f deploy/docker-compose.prod.yml up -d"
else
    echo "❌ 没有成功导入任何镜像"
    exit 1
fi

