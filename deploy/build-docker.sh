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
    
    # 设置环境变量，防止 Docker 尝试从网络拉取镜像
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    # 使用 --pull=never 选项（如果支持）或通过环境变量禁用拉取
    if [ "$NO_CACHE" = "--no-cache" ]; then
        print_warning "使用 --no-cache 选项，将强制重新构建（不使用缓存）"
        print_info "使用本地镜像，不尝试从网络拉取"
        # docker-compose build 不支持 --pull=never，但我们可以通过其他方式
        # 先尝试使用 --pull never（如果支持）
        docker-compose -f deploy/docker-compose.prod.yml build --no-cache --pull never 2>/dev/null || \
        docker-compose -f deploy/docker-compose.prod.yml build --no-cache
    else
        print_info "使用缓存构建（如果 Dockerfile 或代码未更改，将使用缓存）"
        print_info "使用本地镜像，不尝试从网络拉取"
        # 尝试使用 --pull never
        docker-compose -f deploy/docker-compose.prod.yml build --pull never 2>/dev/null || \
        docker-compose -f deploy/docker-compose.prod.yml build
    fi

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

