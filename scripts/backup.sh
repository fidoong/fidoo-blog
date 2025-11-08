#!/bin/bash

# 数据库和文件备份脚本
# 使用方法: ./scripts/backup.sh [full|db|files]

set -e

BACKUP_TYPE=${1:-full}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 创建备份目录
BACKUP_DIR="$PROJECT_DIR/backups"
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
fi

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DATE=$(date +%Y%m%d)

# 备份数据库
backup_database() {
    log_info "开始备份数据库..."
    
    cd "$PROJECT_DIR"
    
    if ! docker-compose ps postgres | grep -q "Up"; then
        log_warn "PostgreSQL 容器未运行，跳过数据库备份"
        return
    fi
    
    BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
    
    docker-compose exec -T postgres pg_dump -U postgres fidoo_blog > "$BACKUP_FILE"
    
    # 压缩备份文件
    gzip "$BACKUP_FILE"
    
    log_info "数据库备份完成: ${BACKUP_FILE}.gz"
    
    # 保留最近 7 天的备份
    find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete
}

# 备份 Redis
backup_redis() {
    log_info "开始备份 Redis..."
    
    cd "$PROJECT_DIR"
    
    if ! docker-compose ps redis | grep -q "Up"; then
        log_warn "Redis 容器未运行，跳过 Redis 备份"
        return
    fi
    
    BACKUP_FILE="$BACKUP_DIR/redis_backup_$TIMESTAMP.rdb"
    
    # Redis 数据已通过 AOF 持久化，这里备份数据卷
    docker run --rm \
        -v fidoo-blog_redis_data:/data \
        -v "$BACKUP_DIR":/backup \
        alpine tar czf "/backup/redis_backup_$TIMESTAMP.tar.gz" -C /data . || {
        log_warn "Redis 备份失败"
    }
    
    log_info "Redis 备份完成: redis_backup_$TIMESTAMP.tar.gz"
    
    # 保留最近 7 天的备份
    find "$BACKUP_DIR" -name "redis_backup_*.tar.gz" -mtime +7 -delete
}

# 备份上传文件
backup_files() {
    log_info "开始备份上传文件..."
    
    UPLOADS_DIR="$PROJECT_DIR/service/uploads"
    
    if [ ! -d "$UPLOADS_DIR" ]; then
        log_warn "上传目录不存在，跳过文件备份"
        return
    fi
    
    BACKUP_FILE="$BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz"
    
    tar czf "$BACKUP_FILE" -C "$PROJECT_DIR/service" uploads
    
    log_info "文件备份完成: $BACKUP_FILE"
    
    # 保留最近 30 天的备份
    find "$BACKUP_DIR" -name "uploads_backup_*.tar.gz" -mtime +30 -delete
}

# 备份日志
backup_logs() {
    log_info "开始备份日志..."
    
    LOGS_DIR="$PROJECT_DIR/service/logs"
    
    if [ ! -d "$LOGS_DIR" ]; then
        log_warn "日志目录不存在，跳过日志备份"
        return
    fi
    
    BACKUP_FILE="$BACKUP_DIR/logs_backup_$TIMESTAMP.tar.gz"
    
    tar czf "$BACKUP_FILE" -C "$PROJECT_DIR/service" logs
    
    log_info "日志备份完成: $BACKUP_FILE"
    
    # 保留最近 7 天的备份
    find "$BACKUP_DIR" -name "logs_backup_*.tar.gz" -mtime +7 -delete
}

# 上传到云存储 (可选)
upload_to_oss() {
    if [ -z "$OSS_ENDPOINT" ] || [ -z "$OSS_ACCESS_KEY_ID" ] || [ -z "$OSS_ACCESS_KEY_SECRET" ]; then
        log_warn "OSS 配置未设置，跳过云存储上传"
        return
    fi
    
    log_info "上传备份到云存储..."
    
    # 这里可以使用阿里云 OSS CLI 或其他工具
    # 示例: ossutil cp "$BACKUP_FILE" "oss://your-bucket/backups/"
}

# 主函数
main() {
    log_info "开始备份 ($BACKUP_TYPE)..."
    
    case $BACKUP_TYPE in
        db)
            backup_database
            backup_redis
            ;;
        files)
            backup_files
            backup_logs
            ;;
        full)
            backup_database
            backup_redis
            backup_files
            backup_logs
            ;;
        *)
            log_warn "未知的备份类型: $BACKUP_TYPE"
            log_warn "使用方法: $0 [full|db|files]"
            exit 1
            ;;
    esac
    
    log_info "备份完成！"
    log_info "备份目录: $BACKUP_DIR"
    
    # 显示备份文件大小
    du -sh "$BACKUP_DIR"/* | tail -5
}

main "$@"

