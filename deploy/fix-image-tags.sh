#!/bin/bash

# 修复镜像标签脚本（如果导入的镜像标签不匹配）

set -e

echo "🔍 检查镜像标签..."
echo ""

# 需要的镜像标签
REQUIRED_TAGS=(
    "node:20-alpine"
    "postgres:14-alpine"
    "redis:6-alpine"
)

MISSING_TAGS=()

for tag in "${REQUIRED_TAGS[@]}"; do
    if docker images | grep -q "$tag"; then
        echo "✅ 标签已存在: $tag"
    else
        echo "⚠️  标签不存在: $tag"
        MISSING_TAGS+=("$tag")
    fi
done

echo ""

if [ ${#MISSING_TAGS[@]} -eq 0 ]; then
    echo "✅ 所有必需的标签都已存在"
    exit 0
fi

echo "🔧 尝试从现有镜像创建标签..."
echo ""

# 尝试从 latest 标签创建
for tag in "${MISSING_TAGS[@]}"; do
    if [[ "$tag" == "node:20-alpine" ]]; then
        if docker images | grep -q "node.*latest"; then
            echo "📝 从 node:latest 创建 node:20-alpine"
            docker tag node:latest node:20-alpine
            echo "✅ 标签已创建"
        elif docker images | grep -q "node.*20"; then
            echo "📝 从 node:20 创建 node:20-alpine"
            docker tag node:20 node:20-alpine
            echo "✅ 标签已创建"
        else
            echo "❌ 找不到可用的 node 镜像"
        fi
    elif [[ "$tag" == "postgres:14-alpine" ]]; then
        if docker images | grep -q "postgres.*latest"; then
            echo "📝 从 postgres:latest 创建 postgres:14-alpine"
            docker tag postgres:latest postgres:14-alpine
            echo "✅ 标签已创建"
        elif docker images | grep -q "postgres.*14"; then
            echo "📝 从 postgres:14 创建 postgres:14-alpine"
            docker tag postgres:14 postgres:14-alpine
            echo "✅ 标签已创建"
        else
            echo "❌ 找不到可用的 postgres 镜像"
        fi
    elif [[ "$tag" == "redis:6-alpine" ]]; then
        if docker images | grep -q "redis.*latest"; then
            echo "📝 从 redis:latest 创建 redis:6-alpine"
            docker tag redis:latest redis:6-alpine
            echo "✅ 标签已创建"
        elif docker images | grep -q "redis.*6"; then
            echo "📝 从 redis:6 创建 redis:6-alpine"
            docker tag redis:6 redis:6-alpine
            echo "✅ 标签已创建"
        else
            echo "❌ 找不到可用的 redis 镜像"
        fi
    fi
    echo ""
done

echo "📋 最终镜像列表："
docker images | grep -E "node|postgres|redis" | head -10
echo ""

# 再次检查
echo "🔍 再次检查必需的标签..."
ALL_OK=true
for tag in "${REQUIRED_TAGS[@]}"; do
    if docker images | grep -q "$tag"; then
        echo "✅ $tag"
    else
        echo "❌ $tag (仍然缺失)"
        ALL_OK=false
    fi
done

echo ""

if [ "$ALL_OK" = true ]; then
    echo "✅ 所有必需的标签都已创建！"
    echo ""
    echo "现在可以运行构建："
    echo "  ./deploy/build-docker.sh"
else
    echo "❌ 仍有标签缺失，请检查镜像是否正确导入"
    echo ""
    echo "查看所有镜像："
    echo "  docker images"
    exit 1
fi

