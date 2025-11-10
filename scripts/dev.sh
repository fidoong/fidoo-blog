#!/bin/bash

# Fidoo Blog 开发环境启动脚本
# 用法: ./scripts/dev.sh [service|web|admin|all]

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

# 检查环境变量
check_env() {
    print_info "检查环境变量..."
    
    if [ ! -f "service/.env" ] && [ ! -f "service/.env.local" ]; then
        print_warning "未找到 service/.env 文件，将使用默认配置"
        print_info "建议创建 service/.env 文件配置数据库和 Redis"
    fi
    
    print_success "环境检查完成"
}

# 安装依赖
install_dependencies() {
    print_info "安装依赖..."
    pnpm install
    print_success "依赖安装完成"
}

# 启动服务
start_service() {
    print_info "启动后端服务 (端口 3005)..."
    pnpm dev:service &
    SERVICE_PID=$!
    print_success "后端服务已启动 (PID: $SERVICE_PID)"
}

# 启动前台网站
start_web() {
    print_info "启动前台网站 (端口 3000)..."
    pnpm dev:web &
    WEB_PID=$!
    print_success "前台网站已启动 (PID: $WEB_PID)"
}

# 启动后台管理
start_admin() {
    print_info "启动后台管理 (端口 3001)..."
    pnpm dev:admin &
    ADMIN_PID=$!
    print_success "后台管理已启动 (PID: $ADMIN_PID)"
}

# 启动所有服务
start_all() {
    print_info "启动所有服务..."
    start_service
    sleep 2
    start_web
    sleep 2
    start_admin
    
    print_success "所有服务已启动"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🚀 开发环境已启动"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  后端服务:  http://localhost:3005"
    echo "  前台网站:  http://localhost:3000"
    echo "  后台管理:  http://localhost:3001"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "按 Ctrl+C 停止所有服务"
    
    # 等待中断信号
    trap 'kill $SERVICE_PID $WEB_PID $ADMIN_PID 2>/dev/null; exit' INT TERM
    wait
}

# 主函数
main() {
    local target=${1:-all}
    
    print_info "Fidoo Blog 开发环境启动脚本"
    echo ""
    
    check_dependencies
    check_env
    
    # 如果 node_modules 不存在，安装依赖
    if [ ! -d "node_modules" ]; then
        install_dependencies
    fi
    
    case $target in
        service)
            start_service
            wait
            ;;
        web)
            start_web
            wait
            ;;
        admin)
            start_admin
            wait
            ;;
        all|*)
            start_all
            ;;
    esac
}

# 运行主函数
main "$@"

