#!/bin/bash

# ============================================
# API 连接诊断脚本
# ============================================
# 用于检查前后端连接是否正常
# ============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   API 连接诊断工具                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# 检查后端服务
log_info "检查后端服务 (http://localhost:3005)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/api/v1/health 2>/dev/null | grep -q "200\|404"; then
    log_success "后端服务正在运行"
    
    # 测试健康检查接口
    HEALTH_RESPONSE=$(curl -s http://localhost:3005/api/v1/health 2>/dev/null || echo "")
    if [ -n "$HEALTH_RESPONSE" ]; then
        log_success "健康检查接口响应正常"
        echo "  响应: $HEALTH_RESPONSE"
    fi
else
    log_error "后端服务未运行或无法访问"
    log_info "请确保后端服务已启动: pnpm service:dev"
fi

echo ""

# 检查 CORS 配置
log_info "检查 CORS 配置..."
CORS_HEADERS=$(curl -s -I -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:3005/api/v1/health 2>/dev/null | grep -i "access-control" || echo "")

if echo "$CORS_HEADERS" | grep -qi "access-control-allow-origin"; then
    log_success "CORS 配置正常"
    echo "$CORS_HEADERS" | while read line; do
        echo "  $line"
    done
else
    log_warning "CORS 配置可能有问题"
    log_info "请检查后端 CORS 配置是否允许 http://localhost:3000"
fi

echo ""

# 检查前端服务
log_info "检查前端服务 (http://localhost:3000)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200\|404"; then
    log_success "前端服务正在运行"
else
    log_error "前端服务未运行或无法访问"
    log_info "请确保前端服务已启动: pnpm web:dev"
fi

echo ""

# 测试 API 接口
log_info "测试 API 接口..."
API_TEST=$(curl -s -w "\n%{http_code}" http://localhost:3005/api/v1/posts?page=1&pageSize=1 2>/dev/null || echo -e "\n000")

HTTP_CODE=$(echo "$API_TEST" | tail -n 1)
RESPONSE_BODY=$(echo "$API_TEST" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    log_success "API 接口响应正常 (HTTP $HTTP_CODE)"
    if [ -n "$RESPONSE_BODY" ]; then
        echo "  响应预览: $(echo "$RESPONSE_BODY" | head -c 100)..."
    fi
elif [ "$HTTP_CODE" = "000" ]; then
    log_error "无法连接到后端服务"
    log_info "可能的原因："
    log_info "  1. 后端服务未启动"
    log_info "  2. 端口被占用或配置错误"
    log_info "  3. 防火墙阻止连接"
else
    log_warning "API 接口返回异常状态码: HTTP $HTTP_CODE"
    if [ -n "$RESPONSE_BODY" ]; then
        echo "  响应: $RESPONSE_BODY"
    fi
fi

echo ""

# 检查端口占用
log_info "检查端口占用情况..."
if lsof -Pi :3005 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PROCESS=$(lsof -Pi :3005 -sTCP:LISTEN | tail -n 1)
    log_success "端口 3005 已被占用（后端）"
    echo "  进程: $PROCESS"
else
    log_error "端口 3005 未被占用（后端服务可能未启动）"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PROCESS=$(lsof -Pi :3000 -sTCP:LISTEN | tail -n 1)
    log_success "端口 3000 已被占用（前端）"
    echo "  进程: $PROCESS"
else
    log_error "端口 3000 未被占用（前端服务可能未启动）"
fi

echo ""

# 检查环境变量
log_info "检查环境变量配置..."
if [ -f "web/.env.local" ]; then
    API_URL=$(grep "NEXT_PUBLIC_API_URL" web/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" || echo "")
    if [ -n "$API_URL" ]; then
        log_success "前端环境变量已配置"
        echo "  NEXT_PUBLIC_API_URL=$API_URL"
    else
        log_warning "前端环境变量文件存在但未配置 NEXT_PUBLIC_API_URL"
        log_info "将使用默认值: http://localhost:3005/api/v1"
    fi
else
    log_info "前端环境变量文件不存在，将使用默认值"
    log_info "默认 API URL: http://localhost:3005/api/v1"
fi

echo ""

# 总结
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_info "诊断完成！"
echo ""
log_info "如果接口仍然 pending，请检查："
log_info "  1. 打开浏览器开发者工具 (F12)"
log_info "  2. 查看 Console 标签页的错误信息"
log_info "  3. 查看 Network 标签页的请求状态"
log_info "  4. 确认后端服务日志是否有错误"
echo ""

