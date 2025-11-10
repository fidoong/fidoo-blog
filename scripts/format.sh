#!/bin/bash

# Fidoo Blog 代码格式化脚本
# 用法: ./scripts/format.sh [check|fix]

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Prettier
check_prettier() {
    if ! command -v prettier &> /dev/null; then
        if [ -f "node_modules/.bin/prettier" ]; then
            PRETTIER_CMD="pnpm exec prettier"
        else
            print_error "Prettier 未安装，请先运行: pnpm install"
            exit 1
        fi
    else
        PRETTIER_CMD="prettier"
    fi
}

# 格式化代码
format_code() {
    print_info "开始格式化代码..."

    check_prettier

    # 格式化所有文件
    $PRETTIER_CMD --write "**/*.{ts,tsx,js,jsx,json,css,scss,md,yml,yaml}" \
        --ignore-path .prettierignore \
        --log-level warn

    print_success "代码格式化完成"
}

# 检查代码格式
check_format() {
    print_info "检查代码格式..."

    check_prettier

    # 检查格式
    if $PRETTIER_CMD --check "**/*.{ts,tsx,js,jsx,json,css,scss,md,yml,yaml}" \
        --ignore-path .prettierignore \
        --log-level warn; then
        print_success "代码格式检查通过"
        exit 0
    else
        print_error "代码格式检查失败，请运行: pnpm format 或 ./scripts/format.sh fix"
        exit 1
    fi
}

# 运行 ESLint 修复
lint_fix() {
    print_info "运行 ESLint 修复..."
    pnpm lint:fix || true
    print_success "ESLint 修复完成"
}

# 主函数
main() {
    local action=${1:-fix}

    print_info "Fidoo Blog 代码格式化脚本"
    echo ""

    case $action in
        check)
            check_format
            ;;
        fix)
            format_code
            lint_fix
            print_success "所有格式化任务完成"
            ;;
        *)
            print_error "未知操作: $action"
            echo "用法: ./scripts/format.sh [check|fix]"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"

