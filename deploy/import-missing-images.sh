#!/bin/bash

# 导入缺失的 Docker 镜像脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

IMAGES_DIR="./deploy/docker-images"

# 检查镜像目录
if [ ! -d "$IMAGES_DIR" ]; then
    print_error "镜像目录不存在: $IMAGES_DIR"
    echo ""
    print_info "请先上传镜像文件到服务器："
    echo "  scp -r docker-images root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/"
    exit 1
fi

print_info "检查缺失的镜像..."
echo ""

# 需要检查的镜像
REQUIRED_IMAGES=(
    "node:20-alpine"
    "postgres:14-alpine"
    "redis:6-alpine"
)

MISSING_IMAGES=()

for image in "${REQUIRED_IMAGES[@]}"; do
    REPO=$(echo "$image" | cut -d: -f1)
    TAG=$(echo "$image" | cut -d: -f2)

    if docker images "$REPO" | grep -qE "^${REPO}[[:space:]]+${TAG}[[:space:]]"; then
        print_success "✅ 镜像已存在: $image"
    else
        print_warning "⚠️  镜像不存在: $image"
        MISSING_IMAGES+=("$image")
    fi
done

echo ""

if [ ${#MISSING_IMAGES[@]} -eq 0 ]; then
    print_success "所有必需的镜像都已存在！"
    exit 0
fi

print_info "需要导入以下镜像："
for image in "${MISSING_IMAGES[@]}"; do
    echo "  - $image"
done
echo ""

# 导入缺失的镜像
IMPORTED=0
FAILED=0

for image in "${MISSING_IMAGES[@]}"; do
    FILENAME=$(echo "$image" | tr '/:' '_')
    FILE_PATH="$IMAGES_DIR/${FILENAME}.tar.gz"

    if [ -f "$FILE_PATH" ]; then
        print_info "导入: $image"
        if gunzip -c "$FILE_PATH" | docker load; then
            print_success "✅ 导入成功: $image"
            ((IMPORTED++))
        else
            print_error "❌ 导入失败: $image"
            ((FAILED++))
        fi
        echo ""
    else
        print_warning "⚠️  镜像文件不存在: $FILE_PATH"
        ((FAILED++))
        echo ""
    fi
done

echo "📊 导入统计："
echo "  ✅ 成功: $IMPORTED"
echo "  ❌ 失败: $FAILED"
echo ""

if [ $IMPORTED -gt 0 ]; then
    print_success "部分镜像导入完成！"
    echo ""
    print_info "已导入的镜像："
    docker images | grep -E "node|postgres|redis" | head -10
    echo ""

    if [ $FAILED -gt 0 ]; then
        print_warning "仍有镜像未导入，请检查："
        echo "1. 镜像文件是否存在"
        echo "2. 是否需要从本地重新上传"
        echo ""
        echo "上传命令："
        echo "  scp -r docker-images root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/"
    fi
else
    print_error "没有成功导入任何镜像"
    echo ""
    print_info "请检查："
    echo "1. 镜像文件是否存在: $IMAGES_DIR"
    echo "2. 文件是否完整"
    echo "3. 是否需要从本地重新上传"
    exit 1
fi

