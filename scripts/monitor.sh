#!/bin/bash

# 服务监控脚本
# 使用方法: ./scripts/monitor.sh [status|health|logs|stats]

set -e

COMMAND=${1:-status}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查服务状态
check_status() {
    log_info "检查服务状态..."
    
    cd "$PROJECT_DIR"
    
    services=("postgres" "redis" "service" "web" "admin" "nginx")
    
    echo ""
    echo -e "${BLUE}服务状态:${NC}"
    echo "----------------------------------------"
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            echo -e "${GREEN}✓${NC} $service: 运行中"
        else
            echo -e "${RED}✗${NC} $service: 未运行"
        fi
    done
    
    echo "----------------------------------------"
    echo ""
    
    docker-compose ps
}

# 健康检查
check_health() {
    log_info "执行健康检查..."
    
    cd "$PROJECT_DIR"
    
    # 检查数据库
    echo ""
    echo -e "${BLUE}数据库健康检查:${NC}"
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}✓${NC} PostgreSQL: 健康"
    else
        echo -e "${RED}✗${NC} PostgreSQL: 不健康"
    fi
    
    # 检查 Redis
    echo ""
    echo -e "${BLUE}Redis 健康检查:${NC}"
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        echo -e "${GREEN}✓${NC} Redis: 健康"
    else
        echo -e "${RED}✗${NC} Redis: 不健康"
    fi
    
    # 检查后端服务
    echo ""
    echo -e "${BLUE}后端服务健康检查:${NC}"
    if curl -sf http://localhost:3005/health &> /dev/null; then
        echo -e "${GREEN}✓${NC} Service: 健康"
    else
        echo -e "${RED}✗${NC} Service: 不健康"
    fi
    
    # 检查前端
    echo ""
    echo -e "${BLUE}前端服务健康检查:${NC}"
    if curl -sf http://localhost:3001 &> /dev/null; then
        echo -e "${GREEN}✓${NC} Web: 健康"
    else
        echo -e "${RED}✗${NC} Web: 不健康"
    fi
    
    # 检查管理后台
    if curl -sf http://localhost:3002 &> /dev/null; then
        echo -e "${GREEN}✓${NC} Admin: 健康"
    else
        echo -e "${RED}✗${NC} Admin: 不健康"
    fi
    
    echo ""
}

# 查看日志
view_logs() {
    SERVICE=${2:-}
    
    cd "$PROJECT_DIR"
    
    if [ -z "$SERVICE" ]; then
        log_info "查看所有服务日志 (Ctrl+C 退出)..."
        docker-compose logs -f
    else
        log_info "查看 $SERVICE 服务日志 (Ctrl+C 退出)..."
        docker-compose logs -f "$SERVICE"
    fi
}

# 资源统计
show_stats() {
    log_info "资源使用统计..."
    
    cd "$PROJECT_DIR"
    
    echo ""
    echo -e "${BLUE}容器资源使用:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    
    echo ""
    echo -e "${BLUE}磁盘使用:${NC}"
    docker system df
    
    echo ""
    echo -e "${BLUE}数据库连接数:${NC}"
    docker-compose exec -T postgres psql -U postgres -c "SELECT count(*) as connections FROM pg_stat_activity;" 2>/dev/null || echo "无法获取数据库连接数"
    
    echo ""
    echo -e "${BLUE}Redis 信息:${NC}"
    docker-compose exec -T redis redis-cli INFO stats 2>/dev/null | grep -E "total_connections|total_commands_processed" || echo "无法获取 Redis 信息"
    
    echo ""
}

# 系统信息
show_system_info() {
    log_info "系统信息..."
    
    echo ""
    echo -e "${BLUE}操作系统:${NC}"
    uname -a
    
    echo ""
    echo -e "${BLUE}Docker 版本:${NC}"
    docker --version
    docker-compose --version
    
    echo ""
    echo -e "${BLUE}磁盘空间:${NC}"
    df -h
    
    echo ""
    echo -e "${BLUE}内存使用:${NC}"
    free -h
    
    echo ""
    echo -e "${BLUE}CPU 信息:${NC}"
    lscpu | grep -E "Model name|CPU\(s\)|Thread|Core"
    
    echo ""
}

# 主函数
main() {
    case $COMMAND in
        status)
            check_status
            ;;
        health)
            check_health
            ;;
        logs)
            view_logs "$@"
            ;;
        stats)
            show_stats
            ;;
        system)
            show_system_info
            ;;
        *)
            echo "使用方法: $0 [status|health|logs|stats|system]"
            echo ""
            echo "命令说明:"
            echo "  status  - 查看服务状态"
            echo "  health  - 执行健康检查"
            echo "  logs    - 查看日志 (可指定服务名)"
            echo "  stats   - 查看资源统计"
            echo "  system  - 查看系统信息"
            exit 1
            ;;
    esac
}

main "$@"

