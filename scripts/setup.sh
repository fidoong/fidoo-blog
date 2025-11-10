#!/bin/bash

# Fidoo Blog 项目初始化脚本
# 用法: ./scripts/setup.sh

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
    print_info "检查系统依赖..."
    
    local missing_deps=()
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    else
        local node_version=$(node -v)
        print_success "Node.js: $node_version"
    fi
    
    if ! command -v pnpm &> /dev/null; then
        missing_deps+=("pnpm")
    else
        local pnpm_version=$(pnpm -v)
        print_success "pnpm: $pnpm_version"
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "缺少以下依赖: ${missing_deps[*]}"
        echo ""
        echo "安装指南:"
        echo "  Node.js: https://nodejs.org/"
        echo "  pnpm:   npm install -g pnpm"
        exit 1
    fi
    
    print_success "所有依赖已安装"
}

# 安装项目依赖
install_dependencies() {
    print_info "安装项目依赖..."
    pnpm install
    print_success "依赖安装完成"
}

# 设置 Git Hooks
setup_git_hooks() {
    print_info "设置 Git Hooks..."
    
    if [ -d ".git" ]; then
        if [ -f "node_modules/.bin/husky" ]; then
            pnpm exec husky install || true
            print_success "Git Hooks 设置完成"
        else
            print_warning "husky 未安装，跳过 Git Hooks 设置"
        fi
    else
        print_warning "不是 Git 仓库，跳过 Git Hooks 设置"
    fi
}

# 创建环境变量文件
create_env_files() {
    print_info "检查环境变量文件..."
    
    # 后端服务环境变量
    if [ ! -f "service/.env" ] && [ ! -f "service/.env.local" ]; then
        print_info "创建 service/.env.example..."
        cat > service/.env.example << 'EOF'
# 应用配置
NODE_ENV=development
PORT=3005
APP_NAME=Fidoo Blog
APP_URL=http://localhost:3005

# 数据库配置
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=fidoo_blog
DB_SYNCHRONIZE=false
DB_LOGGING=true

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OAuth 配置 (可选)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# 限流配置
THROTTLE_TTL=60
THROTTLE_LIMIT=100
EOF
        print_warning "请复制 service/.env.example 到 service/.env 并配置"
    fi
    
    print_success "环境变量文件检查完成"
}

# 构建共享包
build_shared() {
    print_info "构建共享包..."
    pnpm build:shared || print_warning "共享包构建失败，可以稍后手动构建"
}

# 主函数
main() {
    print_info "Fidoo Blog 项目初始化"
    echo ""
    
    check_dependencies
    install_dependencies
    setup_git_hooks
    create_env_files
    build_shared
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ✅ 项目初始化完成"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "下一步:"
    echo "  1. 配置环境变量: cp service/.env.example service/.env"
    echo "  2. 启动开发环境: pnpm dev 或 ./scripts/dev.sh"
    echo "  3. 查看帮助:     make help"
    echo ""
}

# 运行主函数
main "$@"

