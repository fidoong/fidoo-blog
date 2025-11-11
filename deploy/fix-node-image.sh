#!/bin/bash

# 修复 Node.js 镜像问题（删除旧的错误版本，使用正确的）

set -e

echo "🔍 检查 Node.js 镜像..."
echo ""

# 列出所有 node 镜像
echo "=== 所有 node 镜像 ==="
docker images | grep "^node" || echo "没有找到 node 镜像"
echo ""

# 检查每个 node:20-alpine 镜像的版本
echo "=== 检查 node:20-alpine 镜像版本 ==="
NODE_IMAGES=$(docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep "^node:20-alpine" || true)

if [ -z "$NODE_IMAGES" ]; then
    echo "❌ 没有找到 node:20-alpine 镜像"
    exit 1
fi

# 如果有多个 node:20-alpine，找出正确的
CORRECT_IMAGE_ID=""
while IFS= read -r line; do
    IMAGE_ID=$(echo "$line" | awk '{print $2}')
    echo "检查镜像 ID: $IMAGE_ID"
    VERSION=$(docker run --rm "$IMAGE_ID" node --version 2>/dev/null || echo "无法运行")
    echo "  版本: $VERSION"
    
    # 检查是否是 v18+ 版本
    if echo "$VERSION" | grep -qE "v(1[89]|2[0-9])"; then
        echo "  ✅ 版本正确（v18+）"
        CORRECT_IMAGE_ID="$IMAGE_ID"
        break
    else
        echo "  ❌ 版本不正确（需要 v18+）"
    fi
    echo ""
done <<< "$NODE_IMAGES"

echo ""

if [ -z "$CORRECT_IMAGE_ID" ]; then
    echo "❌ 没有找到版本正确的 node:20-alpine 镜像"
    echo ""
    echo "解决方案："
    echo "1. 检查 node:latest 版本："
    echo "   docker run --rm node:latest node --version"
    echo ""
    echo "2. 如果 node:latest 是 v20+，使用它："
    echo "   docker rmi node:20-alpine"
    echo "   docker tag node:latest node:20-alpine"
    echo ""
    echo "3. 或者从本地重新导入正确的镜像"
    exit 1
fi

# 删除所有 node:20-alpine 标签
echo "🗑️  删除所有 node:20-alpine 标签..."
docker images --format "{{.Repository}}:{{.Tag}} {{.ID}}" | grep "^node:20-alpine" | while read -r line; do
    IMAGE_ID=$(echo "$line" | awk '{print $2}')
    if [ "$IMAGE_ID" != "$CORRECT_IMAGE_ID" ]; then
        echo "  删除错误的镜像: $IMAGE_ID"
        docker rmi "$IMAGE_ID" 2>/dev/null || true
    fi
done

# 确保正确的镜像有 node:20-alpine 标签
echo "📝 确保正确的镜像有 node:20-alpine 标签..."
CURRENT_TAG=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep "^node:20-alpine" | head -1)

if [ -z "$CURRENT_TAG" ] || [ "$CURRENT_TAG" != "node:20-alpine" ]; then
    echo "  为正确的镜像打标签..."
    docker tag "$CORRECT_IMAGE_ID" node:20-alpine
    echo "  ✅ 标签已创建"
fi

# 验证最终结果
echo ""
echo "✅ 修复完成！"
echo ""
echo "=== 最终 node 镜像 ==="
docker images | grep "^node"
echo ""
echo "=== 验证 node:20-alpine 版本 ==="
FINAL_VERSION=$(docker run --rm node:20-alpine node --version 2>/dev/null)
echo "版本: $FINAL_VERSION"

if echo "$FINAL_VERSION" | grep -qE "v(1[89]|2[0-9])"; then
    echo "✅ 版本正确！"
    echo ""
    echo "现在可以运行构建："
    echo "  ./deploy/build-docker.sh"
else
    echo "❌ 版本仍然不正确"
    exit 1
fi

