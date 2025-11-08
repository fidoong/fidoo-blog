#!/bin/bash

# 企业级部署脚本
# 使用方法: ./scripts/deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要工具
check_requirements() {
    log_info "检查部署环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查 docker-compose 或 docker compose
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
        log_info "使用 docker compose（新版本）"
    else
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_info "环境检查通过"
}

# 检查密钥文件
check_secrets() {
    log_info "检查密钥文件..."
    
    SECRETS_DIR="$PROJECT_DIR/secrets"
    if [ ! -d "$SECRETS_DIR" ]; then
        log_warn "secrets 目录不存在，正在创建..."
        mkdir -p "$SECRETS_DIR"
        chmod 700 "$SECRETS_DIR"
    fi
    
    required_secrets=(
        "postgres_password.txt"
        "db_password.txt"
        "redis_password.txt"
        "jwt_secret.txt"
        "jwt_refresh_secret.txt"
    )
    
    for secret in "${required_secrets[@]}"; do
        if [ ! -f "$SECRETS_DIR/$secret" ]; then
            log_warn "密钥文件 $secret 不存在，正在生成..."
            openssl rand -base64 32 > "$SECRETS_DIR/$secret"
            chmod 600 "$SECRETS_DIR/$secret"
            log_info "已生成密钥文件: $secret"
        fi
    done
    
    log_info "密钥文件检查完成"
}

# 检查环境变量
check_env() {
    log_info "检查环境变量..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -z "$CORS_ORIGINS" ]; then
            log_warn "CORS_ORIGINS 未设置，使用默认值"
            export CORS_ORIGINS="https://www.yourdomain.com,https://admin.yourdomain.com"
        fi
        
        if [ -z "$NEXT_PUBLIC_API_URL" ]; then
            log_warn "NEXT_PUBLIC_API_URL 未设置，使用默认值"
            export NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api/v1"
        fi
    fi
    
    log_info "环境变量检查完成"
}

# 备份现有数据
backup_before_deploy() {
    log_info "部署前备份..."
    
    BACKUP_DIR="$PROJECT_DIR/backups"
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    # 备份数据库（使用 eval 处理带空格的命令）
    if eval "$DOCKER_COMPOSE_CMD ps postgres" 2>/dev/null | grep -q "Up"; then
        log_info "备份数据库..."
        eval "$DOCKER_COMPOSE_CMD exec -T postgres pg_dump -U postgres fidoo_blog" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql" || log_warn "数据库备份失败"
    fi
    
    # 备份上传文件
    if [ -d "$PROJECT_DIR/service/uploads" ]; then
        log_info "备份上传文件..."
        tar czf "$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz" -C "$PROJECT_DIR/service" uploads || log_warn "文件备份失败"
    fi
    
    log_info "备份完成"
}

# 构建镜像
build_images() {
    log_info "构建 Docker 镜像..."
    
    cd "$PROJECT_DIR"
    
    # DOCKER_COMPOSE_CMD 已在 check_requirements 中设置
    
    if [ "$ENVIRONMENT" = "production" ]; then
        eval "$DOCKER_COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml build --no-cache"
    else
        eval "$DOCKER_COMPOSE_CMD build --no-cache"
    fi
    
    log_info "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    cd "$PROJECT_DIR"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        eval "$DOCKER_COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml up -d"
    else
        eval "$DOCKER_COMPOSE_CMD up -d"
    fi
    
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    check_services_health
}

# 检查服务健康状态
check_services_health() {
    log_info "检查服务健康状态..."
    
    services=("postgres" "redis" "service" "web" "admin" "nginx")
    
    for service in "${services[@]}"; do
        if eval "$DOCKER_COMPOSE_CMD ps $service" 2>/dev/null | grep -q "Up"; then
            log_info "$service 服务运行正常"
        else
            log_error "$service 服务启动失败"
            eval "$DOCKER_COMPOSE_CMD logs $service"
            exit 1
        fi
    done
}

# 运行数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."
    
    cd "$PROJECT_DIR"
    
    # 等待数据库就绪
    log_info "等待数据库就绪..."
    sleep 5
    
    eval "$DOCKER_COMPOSE_CMD exec -T service sh -c 'cd /app && npm run migration:run'" || {
        log_warn "数据库迁移失败，请手动检查"
    }
    
    log_info "数据库迁移完成"
}

# 主函数
main() {
    log_info "开始部署到 $ENVIRONMENT 环境..."
    
    cd "$PROJECT_DIR"
    
    check_requirements
    check_secrets
    check_env
    backup_before_deploy
    build_images
    start_services
    run_migrations
    
    log_info "部署完成！"
    log_info "查看服务状态: $DOCKER_COMPOSE_CMD ps"
    log_info "查看日志: $DOCKER_COMPOSE_CMD logs -f"
}

main "$@"

