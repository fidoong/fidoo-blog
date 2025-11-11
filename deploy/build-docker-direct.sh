#!/bin/bash

# 直接使用 docker build 构建（避免 docker-compose 的网络拉取问题）

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
        print_info "请先运行: ./deploy/import-images.sh"
        exit 1
    fi

    print_success "所有必需的镜像都已存在"
    echo ""
}

# 使用 docker build 直接构建
build_with_docker() {
    print_info "使用 docker build 直接构建（不尝试从网络拉取）..."
    echo ""

    NO_CACHE=${1:-""}
    BUILD_ARGS="--pull=never"
    
    if [ "$NO_CACHE" = "--no-cache" ]; then
        BUILD_ARGS="$BUILD_ARGS --no-cache"
        print_warning "使用 --no-cache 选项"
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
}

# 主函数
main() {
    print_info "Fidoo Blog Docker 直接构建脚本"
    echo ""

    # 检查镜像
    check_images

    # 构建
    build_with_docker "$@"

    print_success "✅ 所有镜像构建完成！"
    echo ""
    print_info "下一步："
    echo "  启动服务: docker-compose -f deploy/docker-compose.prod.yml up -d"
    echo "  查看日志: docker-compose -f deploy/docker-compose.prod.yml logs -f"
    echo ""
}

# 运行主函数
main "$@"

