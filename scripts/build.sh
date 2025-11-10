#!/bin/bash

# Fidoo Blog 构建脚本
# 用法: ./scripts/build.sh [service|web|admin|shared|all]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 打印带颜色的消息
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

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm 未安装，请先安装 pnpm"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "node 未安装，请先安装 Node.js"
        exit 1
    fi
    
    print_success "依赖检查通过"
}

# 清理构建产物
clean_build() {
    print_info "清理旧的构建产物..."
    pnpm clean
    print_success "清理完成"
}

# 构建共享包
build_shared() {
    print_info "构建共享包..."
    pnpm build:shared
    print_success "共享包构建完成"
}

# 构建后端服务
build_service() {
    print_info "构建后端服务..."
    pnpm build:service
    print_success "后端服务构建完成"
}

# 构建前台网站
build_web() {
    print_info "构建前台网站..."
    pnpm build:web
    print_success "前台网站构建完成"
}

# 构建后台管理
build_admin() {
    print_info "构建后台管理..."
    pnpm build:admin
    print_success "后台管理构建完成"
}

# 构建所有
build_all() {
    print_info "开始构建所有项目..."
    
    # 先构建共享包
    build_shared
    
    # 然后构建其他项目（依赖共享包）
    build_service
    build_web
    build_admin
    
    print_success "所有项目构建完成"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ✅ 构建完成"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  后端服务: service/dist"
    echo "  前台网站: web/.next"
    echo "  后台管理: admin/.next"
    echo "  共享包:   packages/shared/dist"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 主函数
main() {
    local target=${1:-all}
    local clean=${2:-false}
    
    print_info "Fidoo Blog 构建脚本"
    echo ""
    
    check_dependencies
    
    # 如果需要清理
    if [ "$clean" = "clean" ] || [ "$clean" = "true" ]; then
        clean_build
    fi
    
    case $target in
        shared)
            build_shared
            ;;
        service)
            build_shared
            build_service
            ;;
        web)
            build_shared
            build_web
            ;;
        admin)
            build_shared
            build_admin
            ;;
        all|*)
            build_all
            ;;
    esac
}

# 运行主函数
main "$@"

