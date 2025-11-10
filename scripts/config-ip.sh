#!/bin/bash

# 快速配置 IP 地址脚本
# 用法: ./scripts/config-ip.sh <your-server-ip>

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

# 验证 IP 地址格式
validate_ip() {
    local ip=$1
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        return 0
    else
        return 1
    fi
}

# 主函数
main() {
    local server_ip=$1

    print_info "Fidoo Blog IP 地址配置脚本"
    echo ""

    # 如果没有提供 IP，提示输入
    if [ -z "$server_ip" ]; then
        read -p "请输入服务器公网 IP 地址: " server_ip
    fi

    # 验证 IP 格式
    if ! validate_ip "$server_ip"; then
        print_error "IP 地址格式不正确: $server_ip"
        echo "正确格式示例: 123.456.789.012"
        exit 1
    fi

    print_info "配置 IP 地址: $server_ip"
    echo ""

    # 更新 service/.env.production
    if [ -f "service/.env.production" ]; then
        print_info "更新 service/.env.production..."
        sed -i.bak "s/YOUR_SERVER_IP/$server_ip/g" service/.env.production
        sed -i.bak "s/your-domain.com/$server_ip/g" service/.env.production
        sed -i.bak "s|https://|http://|g" service/.env.production
        rm -f service/.env.production.bak
        print_success "service/.env.production 已更新"
    else
        print_warning "service/.env.production 不存在，跳过"
    fi

    # 更新 deploy/docker-compose.prod.yml
    if [ -f "deploy/docker-compose.prod.yml" ]; then
        print_info "更新 deploy/docker-compose.prod.yml..."
        sed -i.bak "s/YOUR_SERVER_IP/$server_ip/g" deploy/docker-compose.prod.yml
        sed -i.bak "s|https://|http://|g" deploy/docker-compose.prod.yml
        rm -f deploy/docker-compose.prod.yml.bak
        print_success "deploy/docker-compose.prod.yml 已更新"
    else
        print_warning "deploy/docker-compose.prod.yml 不存在，跳过"
    fi

    echo ""
    print_success "配置完成！"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  📍 访问地址"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  前台网站:  http://$server_ip:3000"
    echo "  后台管理:  http://$server_ip:3001"
    echo "  后端 API:  http://$server_ip:3005/api"
    echo "  API 文档:  http://$server_ip:3005/api/docs"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  重要提醒："
    echo "  1. 确保防火墙已开放端口 3000, 3001, 3005"
    echo "  2. 使用 IP 访问无法配置 SSL 证书"
    echo "  3. 建议仅用于测试环境"
    echo ""
}

# 运行主函数
main "$@"

