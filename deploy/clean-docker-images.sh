#!/bin/bash

# 清理 Docker 镜像脚本

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

# 显示当前镜像
show_images() {
    echo "=== 当前 Docker 镜像 ==="
    docker images
    echo ""
}

# 删除特定镜像
delete_specific_images() {
    local images=("$@")
    
    for image in "${images[@]}"; do
        if docker images | grep -qE "^${image%:*}[[:space:]]+${image#*:}"; then
            print_info "删除镜像: $image"
            docker rmi "$image" 2>/dev/null && print_success "✅ 已删除: $image" || print_warning "⚠️  删除失败或镜像正在使用: $image"
        else
            print_warning "镜像不存在: $image"
        fi
    done
}

# 删除项目相关镜像
delete_project_images() {
    print_info "删除项目相关镜像..."
    
    # 删除构建的镜像
    PROJECT_IMAGES=(
        "fidoo-blog-service"
        "fidoo-blog-web"
        "fidoo-blog-admin"
    )
    
    for image in "${PROJECT_IMAGES[@]}"; do
        print_info "查找并删除: $image"
        docker images --format "{{.Repository}}:{{.Tag}}" | grep "^${image}" | while read -r img; do
            print_info "  删除: $img"
            docker rmi "$img" 2>/dev/null && print_success "    ✅ 已删除" || print_warning "    ⚠️  删除失败或正在使用"
        done
    done
}

# 删除基础镜像
delete_base_images() {
    print_info "删除基础镜像..."
    
    BASE_IMAGES=(
        "node:20-alpine"
        "node:latest"
        "postgres:14-alpine"
        "postgres:latest"
        "redis:6-alpine"
        "redis:latest"
    )
    
    for image in "${BASE_IMAGES[@]}"; do
        REPO=$(echo "$image" | cut -d: -f1)
        TAG=$(echo "$image" | cut -d: -f2)
        
        if docker images "$REPO" | grep -qE "^${REPO}[[:space:]]+${TAG}[[:space:]]"; then
            print_info "删除: $image"
            docker rmi "$image" 2>/dev/null && print_success "  ✅ 已删除" || print_warning "  ⚠️  删除失败或正在使用"
        fi
    done
}

# 删除所有未使用的镜像
delete_unused_images() {
    print_warning "删除所有未使用的镜像（dangling images）..."
    docker image prune -f
    print_success "✅ 已清理未使用的镜像"
}

# 删除所有镜像（危险操作）
delete_all_images() {
    print_error "⚠️  警告：这将删除所有 Docker 镜像！"
    read -p "确认删除所有镜像？(yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        print_warning "删除所有镜像..."
        docker rmi $(docker images -q) 2>/dev/null || print_warning "部分镜像可能正在使用，无法删除"
        print_success "✅ 已删除所有可删除的镜像"
    else
        print_info "操作已取消"
    fi
}

# 主菜单
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Docker 镜像清理脚本"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    show_images
    
    echo "请选择操作："
    echo "  1) 删除项目镜像（fidoo-blog-*）"
    echo "  2) 删除基础镜像（node, postgres, redis）"
    echo "  3) 删除特定镜像（手动指定）"
    echo "  4) 删除未使用的镜像（dangling）"
    echo "  5) 删除所有镜像（危险！）"
    echo "  6) 退出"
    echo ""
    read -p "请输入选项 (1-6): " choice
    
    case $choice in
        1)
            delete_project_images
            ;;
        2)
            delete_base_images
            ;;
        3)
            echo ""
            read -p "请输入要删除的镜像（格式：repository:tag，多个用空格分隔）: " images_input
            IFS=' ' read -ra images_array <<< "$images_input"
            delete_specific_images "${images_array[@]}"
            ;;
        4)
            delete_unused_images
            ;;
        5)
            delete_all_images
            ;;
        6)
            print_info "退出"
            exit 0
            ;;
        *)
            print_error "无效选项"
            exit 1
            ;;
    esac
    
    echo ""
    print_info "清理后的镜像列表："
    show_images
}

# 如果提供了参数，直接执行
if [ $# -gt 0 ]; then
    case "$1" in
        --project)
            delete_project_images
            ;;
        --base)
            delete_base_images
            ;;
        --unused)
            delete_unused_images
            ;;
        --all)
            delete_all_images
            ;;
        --specific)
            shift
            delete_specific_images "$@"
            ;;
        *)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项："
            echo "  --project    删除项目镜像"
            echo "  --base       删除基础镜像"
            echo "  --unused     删除未使用的镜像"
            echo "  --all        删除所有镜像（危险）"
            echo "  --specific   删除指定镜像（需要提供镜像名）"
            echo ""
            echo "示例："
            echo "  $0 --project"
            echo "  $0 --base"
            echo "  $0 --specific node:20-alpine postgres:14-alpine"
            exit 1
            ;;
    esac
else
    # 交互式菜单
    main
fi

