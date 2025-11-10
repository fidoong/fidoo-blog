#!/bin/bash

# Fidoo Blog 发布脚本
# 用法: ./scripts/release.sh [version]

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

# 检查 Git 状态
check_git_status() {
    print_info "检查 Git 状态..."
    
    if ! command -v git &> /dev/null; then
        print_error "git 未安装"
        exit 1
    fi
    
    # 检查是否有未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "检测到未提交的更改"
        read -p "是否继续? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # 检查是否在正确的分支
    local current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        print_warning "当前分支: $current_branch (建议在 main/master 分支发布)"
        read -p "是否继续? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Git 状态检查通过"
}

# 运行测试
run_tests() {
    print_info "运行测试..."
    pnpm test || {
        print_error "测试失败"
        exit 1
    }
    print_success "测试通过"
}

# 类型检查
typecheck() {
    print_info "运行类型检查..."
    pnpm typecheck || {
        print_error "类型检查失败"
        exit 1
    }
    print_success "类型检查通过"
}

# 代码格式检查
check_format() {
    print_info "检查代码格式..."
    pnpm format:check || {
        print_error "代码格式检查失败，请运行: pnpm format"
        exit 1
    }
    print_success "代码格式检查通过"
}

# 构建项目
build_project() {
    print_info "构建项目..."
    ./scripts/build.sh all clean
    print_success "构建完成"
}

# 创建 Git 标签
create_tag() {
    local version=$1
    print_info "创建 Git 标签: v$version"
    
    if git rev-parse "v$version" >/dev/null 2>&1; then
        print_error "标签 v$version 已存在"
        exit 1
    fi
    
    git tag -a "v$version" -m "Release v$version"
    print_success "标签创建成功"
}

# 主函数
main() {
    local version=${1:-patch}
    
    print_info "Fidoo Blog 发布脚本"
    echo ""
    
    # 检查依赖
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm 未安装"
        exit 1
    fi
    
    # 检查 Git 状态
    check_git_status
    
    # 运行检查
    print_info "运行预发布检查..."
    check_format
    typecheck
    run_tests
    
    # 构建项目
    build_project
    
    # 如果是版本号，创建标签
    if [[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        create_tag "$version"
        print_success "发布准备完成: v$version"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  📦 发布准备完成"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  版本: v$version"
        echo "  标签已创建，可以推送到远程仓库:"
        echo "    git push origin v$version"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        print_success "构建完成，可以部署"
    fi
}

# 运行主函数
main "$@"

