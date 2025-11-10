#!/bin/bash

# Fidoo Blog 部署脚本
# 用法: ./scripts/deploy.sh [docker|pm2] [production|staging]

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

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 用户或 sudo 运行此脚本"
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    print_info "检查系统依赖..."

    local missing_deps=()

    # 检查 Docker（Docker 部署方式）
    if [ "$DEPLOY_METHOD" = "docker" ]; then
        if ! command -v docker &> /dev/null; then
            missing_deps+=("docker")
        fi

        if ! command -v docker-compose &> /dev/null; then
            missing_deps+=("docker-compose")
        fi
    fi

    # 检查 Node.js 和 pnpm（PM2 部署方式）
    if [ "$DEPLOY_METHOD" = "pm2" ]; then
        if ! command -v node &> /dev/null; then
            missing_deps+=("node")
        fi

        if ! command -v pnpm &> /dev/null; then
            missing_deps+=("pnpm")
        fi

        if ! command -v pm2 &> /dev/null; then
            missing_deps+=("pm2")
        fi
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "缺少以下依赖: ${missing_deps[*]}"
        echo ""
        echo "安装指南:"
        if [[ " ${missing_deps[@]} " =~ " docker " ]]; then
            echo "  Docker: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
        fi
        if [[ " ${missing_deps[@]} " =~ " node " ]]; then
            echo "  Node.js: curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs"
        fi
        if [[ " ${missing_deps[@]} " =~ " pnpm " ]]; then
            echo "  pnpm: npm install -g pnpm@10.20.0"
        fi
        if [[ " ${missing_deps[@]} " =~ " pm2 " ]]; then
            echo "  PM2: npm install -g pm2"
        fi
        exit 1
    fi

    print_success "所有依赖已安装"
}

# 检查环境变量文件
check_env_file() {
    print_info "检查环境变量文件..."

    local env_file="service/.env"
    if [ "$ENV" = "production" ]; then
        env_file="service/.env.production"
    fi

    if [ ! -f "$env_file" ]; then
        print_warning "环境变量文件不存在: $env_file"
        if [ -f "service/.env.example" ]; then
            print_info "从示例文件创建..."
            cp service/.env.example "$env_file"
            print_warning "请编辑 $env_file 并配置必要的环境变量"
            read -p "配置完成后按 Enter 继续..." -r
        else
            print_error "找不到环境变量示例文件"
            exit 1
        fi
    fi

    print_success "环境变量文件检查完成"
}

# Docker 部署
deploy_docker() {
    print_info "使用 Docker Compose 部署..."

    # 确定使用的配置文件
    local compose_file="docker-compose.yml"
    if [ "$ENV" = "production" ] && [ -f "deploy/docker-compose.prod.yml" ]; then
        compose_file="deploy/docker-compose.prod.yml"
        print_info "使用生产环境配置: $compose_file"
    fi

    # 构建镜像
    print_info "构建 Docker 镜像..."
    docker-compose -f "$compose_file" build

    # 停止旧容器
    print_info "停止旧容器..."
    docker-compose -f "$compose_file" down || true

    # 启动服务
    print_info "启动服务..."
    docker-compose -f "$compose_file" up -d

    # 等待服务启动
    print_info "等待服务启动..."
    sleep 10

    # 检查服务状态
    print_info "检查服务状态..."
    docker-compose -f "$compose_file" ps

    # 运行数据库迁移
    print_info "运行数据库迁移..."
    docker-compose -f "$compose_file" exec -T service sh -c "cd /app/service && pnpm migration:run" || print_warning "数据库迁移失败或已是最新版本"

    print_success "Docker 部署完成"
}

# PM2 部署
deploy_pm2() {
    print_info "使用 PM2 部署..."

    # 安装依赖
    print_info "安装依赖..."
    pnpm install --frozen-lockfile

    # 构建项目
    print_info "构建项目..."
    pnpm build

    # 停止旧进程
    print_info "停止旧进程..."
    pm2 delete fidoo-blog-service fidoo-blog-web fidoo-blog-admin 2>/dev/null || true

    # 启动服务
    print_info "启动服务..."

    # 启动后端服务
    cd service
    pm2 start dist/main.js --name fidoo-blog-service --node-args="--max-old-space-size=2048"
    cd ..

    # 启动前台网站
    cd web
    pm2 start npm --name fidoo-blog-web -- start
    cd ..

    # 启动后台管理
    cd admin
    pm2 start npm --name fidoo-blog-admin -- start
    cd ..

    # 保存 PM2 配置
    pm2 save

    # 查看状态
    pm2 status

    # 运行数据库迁移
    print_info "运行数据库迁移..."
    cd service
    pnpm migration:run || print_warning "数据库迁移失败或已是最新版本"
    cd ..

    print_success "PM2 部署完成"
}

# 主函数
main() {
    local method=${1:-docker}
    local env=${2:-production}

    DEPLOY_METHOD=$method
    ENV=$env

    print_info "Fidoo Blog 部署脚本"
    echo ""
    print_info "部署方式: $method"
    print_info "环境: $env"
    echo ""

    # 检查 root 权限（某些操作需要）
    if [ "$method" = "docker" ] || [ "$method" = "pm2" ]; then
        # 不需要 root，但某些操作可能需要
        print_warning "某些操作可能需要 root 权限"
    fi

    check_dependencies
    check_env_file

    case $method in
        docker)
            deploy_docker
            ;;
        pm2)
            deploy_pm2
            ;;
        *)
            print_error "未知的部署方式: $method"
            echo "用法: ./scripts/deploy.sh [docker|pm2] [production|staging]"
            exit 1
            ;;
    esac

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ✅ 部署完成"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "下一步:"
    echo "  1. 检查服务状态"
    if [ "$method" = "docker" ]; then
        echo "     docker-compose ps"
        echo "     docker-compose logs -f"
    else
        echo "     pm2 status"
        echo "     pm2 logs"
    fi
    echo "  2. 配置 Nginx 反向代理（参考 deploy/nginx.conf）"
    echo "  3. 配置 SSL 证书"
    echo ""
}

# 运行主函数
main "$@"

