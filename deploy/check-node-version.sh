#!/bin/bash

# 检查 Node.js 镜像版本并修复

set -e

echo "🔍 检查 Node.js 镜像版本..."
echo ""

# 检查 node:20-alpine
if docker images | grep -qE "node[[:space:]]+20-alpine"; then
    echo "检查 node:20-alpine 版本..."
    VERSION=$(docker run --rm node:20-alpine node --version 2>/dev/null || echo "无法运行")
    echo "  版本: $VERSION"
    
    # 检查版本号
    if echo "$VERSION" | grep -qE "v(1[89]|2[0-9])"; then
        echo "  ✅ 版本符合要求（v18+）"
    else
        echo "  ❌ 版本不符合要求（需要 v18+）"
        echo ""
        echo "  尝试使用 node:latest..."
        if docker images | grep -qE "node[[:space:]]+latest"; then
            LATEST_VERSION=$(docker run --rm node:latest node --version 2>/dev/null || echo "无法运行")
            echo "  node:latest 版本: $LATEST_VERSION"
            
            if echo "$LATEST_VERSION" | grep -qE "v(1[89]|2[0-9])"; then
                echo "  ✅ node:latest 版本符合要求"
                echo ""
                echo "  删除旧的 node:20-alpine 标签..."
                docker rmi node:20-alpine 2>/dev/null || true
                echo "  从 node:latest 创建 node:20-alpine 标签..."
                docker tag node:latest node:20-alpine
                echo "  ✅ 标签已更新"
                
                # 再次验证
                NEW_VERSION=$(docker run --rm node:20-alpine node --version 2>/dev/null)
                echo "  新的 node:20-alpine 版本: $NEW_VERSION"
            else
                echo "  ❌ node:latest 版本也不符合要求"
                echo ""
                echo "  需要重新导入正确的 node:20-alpine 镜像"
                exit 1
            fi
        else
            echo "  ❌ 没有找到 node:latest 镜像"
            echo ""
            echo "  需要重新导入正确的 node:20-alpine 镜像"
            exit 1
        fi
    fi
else
    echo "❌ 没有找到 node:20-alpine 镜像"
    exit 1
fi

echo ""
echo "✅ Node.js 镜像版本检查完成"
echo ""
echo "现在可以运行构建："
echo "  ./deploy/build-docker.sh"

