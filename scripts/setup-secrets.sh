#!/bin/bash

# 生成密钥文件脚本
# 使用方法: ./scripts/setup-secrets.sh

set -e

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

# 创建 secrets 目录
SECRETS_DIR="$PROJECT_DIR/secrets"
if [ ! -d "$SECRETS_DIR" ]; then
    mkdir -p "$SECRETS_DIR"
    chmod 700 "$SECRETS_DIR"
    log_info "创建 secrets 目录"
fi

# 生成密钥函数
generate_secret() {
    local file=$1
    local length=${2:-32}
    
    if [ -f "$SECRETS_DIR/$file" ]; then
        log_warn "密钥文件 $file 已存在，跳过生成"
        return
    fi
    
    openssl rand -base64 "$length" > "$SECRETS_DIR/$file"
    chmod 600 "$SECRETS_DIR/$file"
    log_info "已生成密钥文件: $file"
}

# 生成所有密钥
log_info "开始生成密钥文件..."

generate_secret "postgres_password.txt" 32
generate_secret "db_password.txt" 32
generate_secret "redis_password.txt" 32
generate_secret "jwt_secret.txt" 64
generate_secret "jwt_refresh_secret.txt" 64

log_info "密钥文件生成完成！"
log_info "密钥文件位置: $SECRETS_DIR"
log_warn "请妥善保管密钥文件，不要提交到版本控制系统"

