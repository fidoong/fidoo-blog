#!/bin/bash

# ============================================
# Fidoo Blog 开发环境启动脚本
# ============================================
# 功能：
# 1. 检查必要的依赖（Node.js, pnpm, Docker）
# 2. 检查并启动 Docker 服务（PostgreSQL, Redis）
# 3. 检查环境变量配置
# 4. 运行数据库迁移
# 5. 启动前后端开发服务
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================
# 1. 检查依赖
# ============================================
check_dependencies() {
    log_step "检查依赖环境"
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js >= 18.0.0"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低，需要 >= 18.0.0，当前版本: $(node -v)"
        exit 1
    fi
    log_success "Node.js 版本: $(node -v)"
    
    # 检查 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装，请先安装 pnpm >= 8.0.0"
        log_info "安装命令: npm install -g pnpm"
        exit 1
    fi
    
    PNPM_VERSION=$(pnpm -v | cut -d'.' -f1)
    if [ "$PNPM_VERSION" -lt 8 ]; then
        log_error "pnpm 版本过低，需要 >= 8.0.0，当前版本: $(pnpm -v)"
        exit 1
    fi
    log_success "pnpm 版本: $(pnpm -v)"
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    log_success "Docker 已安装"
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    log_success "Docker Compose 已安装"
}

# ============================================
# 2. 检查并安装依赖
# ============================================
check_node_modules() {
    log_step "检查项目依赖"
    
    if [ ! -d "node_modules" ]; then
        log_warning "根目录 node_modules 不存在，正在安装依赖..."
        pnpm install
        log_success "根目录依赖安装完成"
    else
        log_success "根目录依赖已存在"
    fi
    
    # 检查共享包依赖
    if [ ! -d "packages/shared/node_modules" ]; then
        log_warning "packages/shared 依赖未安装，正在安装..."
        cd packages/shared && pnpm install && cd "$ROOT_DIR"
        log_success "共享包依赖安装完成"
    fi
    
    # 检查服务端依赖
    if [ ! -d "service/node_modules" ]; then
        log_warning "service 依赖未安装，正在安装..."
        cd service && pnpm install && cd "$ROOT_DIR"
        log_success "服务端依赖安装完成"
    fi
    
    # 检查前端依赖
    if [ ! -d "web/node_modules" ]; then
        log_warning "web 依赖未安装，正在安装..."
        cd web && pnpm install && cd "$ROOT_DIR"
        log_success "前端依赖安装完成"
    fi
}

# ============================================
# 3. 检查环境变量
# ============================================
check_env_files() {
    log_step "检查环境变量配置"
    
    # 检查后端环境变量
    if [ ! -f "service/.env" ]; then
        log_warning "后端环境变量文件不存在 (service/.env)"
        if [ -f "service/env.example" ]; then
            log_info "正在从 env.example 创建 .env 文件..."
            cp service/env.example service/.env
            log_success "已创建 service/.env，请根据需要修改配置"
        else
            log_error "未找到 service/env.example 文件"
            exit 1
        fi
    else
        log_success "后端环境变量文件已存在"
    fi
    
    # 检查前端环境变量（可选）
    if [ ! -f "web/.env.local" ]; then
        log_info "前端环境变量文件不存在 (web/.env.local)，将使用默认配置"
        log_info "默认 API URL: http://localhost:3005/api/v1"
    else
        log_success "前端环境变量文件已存在"
    fi
}

# ============================================
# 4. 启动 Docker 服务
# ============================================
start_docker_services() {
    log_step "启动 Docker 服务"
    
    # 检查 Docker 是否运行
    if ! docker info &> /dev/null; then
        log_error "Docker 未运行，请先启动 Docker"
        exit 1
    fi
    
    # 检查 PostgreSQL
    if docker-compose ps postgres 2>/dev/null | grep -q "Up"; then
        log_success "PostgreSQL 已在运行"
    else
        log_info "启动 PostgreSQL 和 Redis..."
        docker-compose up -d postgres redis
        
        # 等待服务就绪
        log_info "等待数据库服务就绪..."
        local max_attempts=30
        local attempt=0
        
        while [ $attempt -lt $max_attempts ]; do
            if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
                log_success "PostgreSQL 已就绪"
                break
            fi
            attempt=$((attempt + 1))
            sleep 1
        done
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "PostgreSQL 启动超时"
            exit 1
        fi
        
        # 检查 Redis
        if docker-compose exec -T redis redis-cli ping &> /dev/null; then
            log_success "Redis 已就绪"
        else
            log_warning "Redis 可能未就绪，但继续执行..."
        fi
    fi
}

# ============================================
# 5. 运行数据库迁移
# ============================================
run_migrations() {
    log_step "运行数据库迁移"
    
    cd service
    
    # 检查是否有迁移文件
    if [ -d "src/database/migrations" ] && [ "$(ls -A src/database/migrations/*.ts 2>/dev/null)" ]; then
        log_info "执行数据库迁移..."
        if pnpm migration:run; then
            log_success "数据库迁移完成"
        else
            log_warning "数据库迁移失败，但继续执行..."
        fi
    else
        log_info "未找到数据库迁移文件，跳过迁移步骤"
    fi
    
    cd "$ROOT_DIR"
}

# ============================================
# 6. 检查端口占用
# ============================================
check_ports() {
    log_step "检查端口占用"
    
    # 后端端口 3005
    if lsof -Pi :3005 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口 3005 已被占用，可能已有后端服务在运行"
        read -p "是否继续？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "端口 3005 可用（后端）"
    fi
    
    # 前端端口 3000
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口 3000 已被占用，可能已有前端服务在运行"
        read -p "是否继续？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "端口 3000 可用（前端）"
    fi
}

# ============================================
# 7. 启动开发服务
# ============================================
start_dev_services() {
    log_step "启动开发服务"
    
    echo ""
    log_info "服务配置："
    log_info "  后端服务: http://localhost:3005"
    log_info "  API 文档: http://localhost:3005/api/v1/docs"
    log_info "  前端服务: http://localhost:3000"
    echo ""
    
    # 检查是否安装了 tmux
    if command -v tmux &> /dev/null; then
        log_info "使用 tmux 分屏启动服务..."
        
        # 检查是否已有 tmux session
        if tmux has-session -t fidoo-blog 2>/dev/null; then
            log_warning "tmux session 'fidoo-blog' 已存在"
            read -p "是否删除现有 session 并重新创建？(y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                tmux kill-session -t fidoo-blog
            else
                log_info "附加到现有 session..."
                tmux attach-session -t fidoo-blog
                exit 0
            fi
        fi
        
        # 创建新的 tmux session
        tmux new-session -d -s fidoo-blog -c "$ROOT_DIR"
        
        # 启动后端服务
        tmux rename-window -t fidoo-blog:0 "backend"
        tmux send-keys -t fidoo-blog:0 "pnpm service:dev" C-m
        
        # 创建前端窗口
        tmux new-window -t fidoo-blog -n "frontend"
        tmux send-keys -t fidoo-blog:frontend "pnpm web:dev" C-m
        
        # 创建日志窗口（可选）
        tmux new-window -t fidoo-blog -n "logs"
        tmux send-keys -t fidoo-blog:logs "echo '开发日志窗口 - 可以使用此窗口查看日志或执行其他命令'" C-m
        
        log_success "服务已在 tmux session 'fidoo-blog' 中启动"
        log_info "使用以下命令管理："
        log_info "  查看: tmux attach-session -t fidoo-blog"
        log_info "  分离: Ctrl+B, D"
        log_info "  停止: tmux kill-session -t fidoo-blog"
        echo ""
        
        # 附加到 session
        tmux attach-session -t fidoo-blog
    else
        log_warning "未安装 tmux，将在当前终端启动服务"
        log_info "提示: 安装 tmux 可以获得更好的多窗口体验"
        log_info "      macOS: brew install tmux"
        log_info "      Linux: sudo apt-get install tmux"
        echo ""
        log_info "正在启动服务..."
        echo ""
        log_info "请在新的终端窗口中运行以下命令启动前端："
        log_info "  pnpm web:dev"
        echo ""
        log_info "启动后端服务..."
        pnpm service:dev
    fi
}

# ============================================
# 主函数
# ============================================
main() {
    clear
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   Fidoo Blog 开发环境启动脚本        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    # 执行检查步骤
    check_dependencies
    check_node_modules
    check_env_files
    start_docker_services
    run_migrations
    check_ports
    
    # 启动服务
    start_dev_services
}

# 捕获中断信号
trap 'log_error "脚本被中断"; exit 1' INT TERM

# 运行主函数
main
