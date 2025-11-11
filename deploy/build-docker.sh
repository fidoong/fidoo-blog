#!/bin/bash

# Docker 构建脚本（检查镜像是否存在，避免拉取）

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

# 检查必需的 Docker 镜像
check_images() {
    print_info "检查必需的 Docker 镜像..."
    echo ""

    REQUIRED_IMAGES=(
        "node:20-alpine"
        "postgres:14-alpine"
        "redis:6-alpine"
    )

    MISSING_IMAGES=()
    
    for image in "${REQUIRED_IMAGES[@]}"; do
        # 解析镜像名和标签（格式：repository:tag）
        REPO=$(echo "$image" | cut -d: -f1)
        TAG=$(echo "$image" | cut -d: -f2)
        
        # 检查镜像是否存在（docker images 输出格式：REPOSITORY TAG ...）
        if docker images "$REPO" | grep -qE "^${REPO}[[:space:]]+${TAG}[[:space:]]"; then
            print_success "✅ 镜像已存在: $image"
        else
            print_warning "⚠️  镜像不存在: $image"
            MISSING_IMAGES+=("$image")
        fi
    done

    echo ""

    if [ ${#MISSING_IMAGES[@]} -gt 0 ]; then
        print_error "缺少以下镜像："
        for image in "${MISSING_IMAGES[@]}"; do
            echo "  - $image"
        done
        echo ""
        print_info "解决方案："
        echo "1. 如果已在本地导出镜像，请运行："
        echo "   ./deploy/import-images.sh"
        echo ""
        echo "2. 或者手动导入镜像："
        for image in "${MISSING_IMAGES[@]}"; do
            FILENAME=$(echo "$image" | tr '/:' '_')
            echo "   gunzip -c deploy/docker-images/${FILENAME}.tar.gz | docker load"
        done
        echo ""
        echo "3. 如果镜像文件不存在，请从本地机器上传："
        echo "   scp -r docker-images root@YOUR_SERVER_IP:/opt/fidoo-blog/deploy/"
        echo ""
        exit 1
    fi

    print_success "所有必需的镜像都已存在"
    echo ""
}

# 构建 Docker 镜像
build_images() {
    print_info "开始构建 Docker 镜像..."
    echo ""

    # 使用 --no-cache 选项可以强制重新构建，默认使用缓存
    NO_CACHE=${1:-""}
    
    # 使用 docker build 直接构建，而不是 docker-compose build
    # 明确指定 --pull=false 确保使用本地镜像，不尝试从网络拉取
    print_info "使用 docker build 直接构建（完全使用本地镜像，不尝试网络拉取）"
    
    BUILD_ARGS="--pull=false"
    if [ "$NO_CACHE" = "--no-cache" ]; then
        BUILD_ARGS="$BUILD_ARGS --no-cache"
        print_warning "使用 --no-cache 选项，将强制重新构建"
    fi
    
    # 构建 service
    print_info "构建 service..."
    docker build $BUILD_ARGS \
        -f Dockerfile.service \
        -t fidoo-blog-service:latest \
        . || {
        print_error "service 构建失败"
        exit 1
    }
    print_success "service 构建完成"
    echo ""
    
    # 构建 web
    print_info "构建 web..."
    docker build $BUILD_ARGS \
        -f Dockerfile.web \
        -t fidoo-blog-web:latest \
        . || {
        print_error "web 构建失败"
        exit 1
    }
    print_success "web 构建完成"
    echo ""
    
    # 构建 admin
    print_info "构建 admin..."
    docker build $BUILD_ARGS \
        -f Dockerfile.admin \
        -t fidoo-blog-admin:latest \
        . || {
        print_error "admin 构建失败"
        exit 1
    }
    print_success "admin 构建完成"
    echo ""

    print_success "Docker 镜像构建完成"
    echo ""
}

# 主函数
main() {
    print_info "Fidoo Blog Docker 构建脚本"
    echo ""

    # 检查镜像
    check_images

    # 构建
    build_images "$@"

    print_success "✅ 构建完成！"
    echo ""
    print_info "下一步："
    echo "  启动服务: docker-compose -f deploy/docker-compose.prod.yml up -d"
    echo "  查看日志: docker-compose -f deploy/docker-compose.prod.yml logs -f"
    echo ""
}

# 运行主函数
main "$@"

