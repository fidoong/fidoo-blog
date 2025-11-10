#!/bin/bash
# 修复 Docker Compose Segmentation fault 问题

set -e

echo "🔧 修复 Docker Compose..."

# 1. 删除可能损坏的文件
echo "删除旧文件..."
rm -f /usr/local/bin/docker-compose
rm -f /usr/local/bin/docker-compose-v2

# 2. 检测系统架构
ARCH=$(uname -m)
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

echo "系统信息: $OS $ARCH"

# 3. 根据架构选择正确的版本
case $ARCH in
    x86_64)
        COMPOSE_ARCH="x86_64"
        ;;
    aarch64|arm64)
        COMPOSE_ARCH="aarch64"
        ;;
    armv7l)
        COMPOSE_ARCH="armv7"
        ;;
    *)
        echo "⚠️  未知架构: $ARCH，使用 x86_64"
        COMPOSE_ARCH="x86_64"
        ;;
esac

echo "使用架构: $COMPOSE_ARCH"

# 4. 下载正确的版本（使用稳定版本 v2.24.0）
COMPOSE_VERSION="v2.24.0"
COMPOSE_URL=""

# 尝试多个镜像源
echo "尝试下载 Docker Compose $COMPOSE_VERSION..."

# 方法1: 使用 Gitee 镜像
if curl -fsSL "https://gitee.com/mirrors/docker-compose/releases/download/${COMPOSE_VERSION}/docker-compose-${OS}-${COMPOSE_ARCH}" -o /usr/local/bin/docker-compose 2>/dev/null; then
    echo "✅ 从 Gitee 下载成功"
    COMPOSE_URL="gitee"
# 方法2: 使用 GitHub 加速
elif curl -fsSL "https://ghproxy.com/https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-${OS}-${COMPOSE_ARCH}" -o /usr/local/bin/docker-compose 2>/dev/null; then
    echo "✅ 从 GitHub 加速镜像下载成功"
    COMPOSE_URL="ghproxy"
# 方法3: 使用备用加速
elif curl -fsSL "https://mirror.ghproxy.com/https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-${OS}-${COMPOSE_ARCH}" -o /usr/local/bin/docker-compose 2>/dev/null; then
    echo "✅ 从备用镜像下载成功"
    COMPOSE_URL="mirror"
else
    echo "⚠️  镜像源不可用，使用官方源（可能较慢）..."
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-${OS}-${COMPOSE_ARCH}" -o /usr/local/bin/docker-compose
    COMPOSE_URL="official"
fi

# 5. 添加执行权限
chmod +x /usr/local/bin/docker-compose

# 6. 验证文件
echo ""
echo "验证安装..."
if file /usr/local/bin/docker-compose | grep -q "executable"; then
    echo "✅ 文件类型正确"
else
    echo "⚠️  文件可能不是可执行文件"
fi

# 7. 测试运行
echo "测试运行..."
if /usr/local/bin/docker-compose --version 2>&1 | head -1; then
    echo ""
    echo "✅ Docker Compose 安装成功！"
    docker-compose --version
else
    echo ""
    echo "❌ 仍然有问题，尝试使用 pip 安装..."
    
    # 备用方案：使用 pip
    if command -v pip3 &> /dev/null || command -v pip &> /dev/null; then
        echo "使用 pip 安装..."
        pip3 install docker-compose || pip install docker-compose
        echo "✅ 使用 pip 安装完成"
    else
        echo "安装 pip..."
        apt update
        apt install -y python3-pip
        pip3 install docker-compose
        echo "✅ 使用 pip 安装完成"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 修复完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

