#!/bin/bash

# 本地部署准备脚本
# 用于在部署前检查和准备配置

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

log_step() {
    echo -e "\n${BLUE}==>${NC} $1"
}

# 检查必要文件
check_files() {
    log_step "检查必要文件..."
    
    files=(
        "docker-compose.prod.yml"
        "docker/nginx/nginx.prod.conf"
        "scripts/deploy.sh"
        "scripts/backup.sh"
        "scripts/monitor.sh"
        "scripts/setup-secrets.sh"
    )
    
    missing=0
    for file in "${files[@]}"; do
        if [ ! -f "$PROJECT_DIR/$file" ]; then
            log_error "文件不存在: $file"
            missing=1
        else
            log_info "✓ $file"
        fi
    done
    
    if [ $missing -eq 1 ]; then
        log_error "缺少必要文件，请检查"
        exit 1
    fi
}

# 检查脚本权限
check_permissions() {
    log_step "检查脚本权限..."
    
    for script in scripts/*.sh; do
        if [ ! -x "$script" ]; then
            log_warn "脚本没有执行权限: $script"
            chmod +x "$script"
            log_info "已添加执行权限: $script"
        fi
    done
}

# 检查域名配置
check_domain() {
    log_step "检查域名配置..."
    
    if grep -q "yourdomain.com" docker/nginx/nginx.prod.conf; then
        log_warn "Nginx 配置中仍包含 'yourdomain.com'，需要替换为实际域名"
        log_info "请编辑 docker/nginx/nginx.prod.conf 文件"
        echo ""
        echo "需要替换的位置："
        grep -n "yourdomain.com" docker/nginx/nginx.prod.conf | head -5
        echo ""
        read -p "是否现在编辑？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-vim} docker/nginx/nginx.prod.conf
        fi
    else
        log_info "✓ 域名配置已更新"
    fi
}

# 检查环境变量
check_env() {
    log_step "检查环境变量配置..."
    
    if [ ! -f "service/.env.production" ]; then
        log_warn "生产环境变量文件不存在"
        if [ -f "service/env.example" ]; then
            log_info "从模板创建: service/.env.production"
            cp service/env.example service/.env.production
            log_warn "请编辑 service/.env.production 并配置以下关键项："
            echo "  - CORS_ORIGINS"
            echo "  - NEXT_PUBLIC_API_URL"
            echo "  - 数据库配置"
            echo "  - JWT 密钥（生产环境使用 secrets）"
        fi
    else
        log_info "✓ 环境变量文件存在"
    fi
}

# 创建必要目录
create_directories() {
    log_step "创建必要目录..."
    
    directories=(
        "secrets"
        "backups"
        "docker/nginx/ssl"
        "docker/nginx/conf.d"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$PROJECT_DIR/$dir" ]; then
            mkdir -p "$PROJECT_DIR/$dir"
            log_info "创建目录: $dir"
        fi
        
        # 创建 .gitkeep 文件
        if [ ! -f "$PROJECT_DIR/$dir/.gitkeep" ]; then
            touch "$PROJECT_DIR/$dir/.gitkeep"
        fi
    done
}

# 检查 Docker Compose 配置
check_docker_config() {
    log_step "检查 Docker Compose 配置..."
    
    if command -v docker-compose &> /dev/null; then
        if docker-compose -f docker-compose.yml -f docker-compose.prod.yml config &> /dev/null; then
            log_info "✓ Docker Compose 配置正确"
        else
            log_error "Docker Compose 配置有误"
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml config
            exit 1
        fi
    else
        log_warn "Docker Compose 未安装，跳过配置检查"
    fi
}

# 检查 Git 状态
check_git() {
    log_step "检查 Git 状态..."
    
    if [ -d ".git" ]; then
        # 检查是否有未提交的更改
        if [ -n "$(git status --porcelain)" ]; then
            log_warn "有未提交的更改"
            echo ""
            git status --short | head -10
            echo ""
            log_info "建议提交更改后再部署"
        else
            log_info "✓ 工作区干净"
        fi
        
        # 检查敏感文件
        if git status --porcelain | grep -E "secrets/|\.env|backups/|ssl/"; then
            log_error "检测到敏感文件可能被提交！"
            log_warn "请检查 .gitignore 配置"
        fi
    else
        log_warn "不是 Git 仓库，跳过 Git 检查"
    fi
}

# 生成部署清单
generate_checklist() {
    log_step "生成部署前检查清单..."
    
    cat > DEPLOY_CHECKLIST.md << 'EOF'
# 部署前检查清单

## ✅ 本地准备

- [ ] 所有配置文件已创建
- [ ] 脚本有执行权限
- [ ] Nginx 配置中的域名已更新
- [ ] 环境变量已配置
- [ ] `.gitignore` 已更新
- [ ] 已准备好 SSL 证书（或计划使用 Let's Encrypt）

## 🚀 服务器部署

- [ ] 已连接服务器
- [ ] 已安装 Docker 和 Docker Compose
- [ ] 已配置防火墙（开放 22, 80, 443 端口）
- [ ] 已克隆项目或上传文件
- [ ] 已生成密钥文件（./scripts/setup-secrets.sh）
- [ ] 已配置环境变量
- [ ] 已执行部署（./scripts/deploy.sh production）
- [ ] 已运行数据库迁移
- [ ] 已配置 SSL 证书
- [ ] 已配置 DNS 解析

## 🔍 部署后验证

- [ ] 所有服务正常运行
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] API 可以访问
- [ ] 前端可以访问
- [ ] SSL 证书配置正确
- [ ] 监控脚本正常工作

EOF
    
    log_info "已生成 DEPLOY_CHECKLIST.md"
}

# 主函数
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════╗"
    echo "║   本地部署准备检查脚本                 ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
    
    cd "$PROJECT_DIR"
    
    check_files
    check_permissions
    check_domain
    check_env
    create_directories
    check_docker_config
    check_git
    generate_checklist
    
    echo ""
    log_info "准备检查完成！"
    echo ""
    log_info "下一步："
    echo "  1. 编辑 docker/nginx/nginx.prod.conf 更新域名"
    echo "  2. 编辑 service/.env.production 配置环境变量"
    echo "  3. 查看 DEPLOY_CHECKLIST.md 完成检查清单"
    echo "  4. 提交更改到 Git（如使用）"
    echo "  5. 在服务器上执行部署"
    echo ""
}

main "$@"

