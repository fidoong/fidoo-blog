#!/bin/bash
# 在服务器上执行：配置 IP 地址为 120.55.3.205

SERVER_IP="120.55.3.205"

echo "🔧 配置 IP 地址: $SERVER_IP"

# 1. 配置 service/.env.production
if [ -f "service/.env.production" ]; then
    echo "更新 service/.env.production..."
    sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" service/.env.production
    sed -i "s/your-domain.com/$SERVER_IP/g" service/.env.production
    sed -i "s|https://|http://|g" service/.env.production
    echo "✅ service/.env.production 已更新"
else
    echo "⚠️  service/.env.production 不存在"
fi

# 2. 配置 deploy/docker-compose.prod.yml
if [ -f "deploy/docker-compose.prod.yml" ]; then
    echo "更新 deploy/docker-compose.prod.yml..."
    sed -i "s/YOUR_SERVER_IP/$SERVER_IP/g" deploy/docker-compose.prod.yml
    sed -i "s|https://|http://|g" deploy/docker-compose.prod.yml
    echo "✅ deploy/docker-compose.prod.yml 已更新"
else
    echo "⚠️  deploy/docker-compose.prod.yml 不存在"
fi

# 3. 验证配置
echo ""
echo "验证配置..."
if [ -f "service/.env.production" ]; then
    echo "service/.env.production 中的 APP_URL:"
    grep "APP_URL" service/.env.production | head -1
fi

if [ -f "deploy/docker-compose.prod.yml" ]; then
    echo "deploy/docker-compose.prod.yml 中的 NEXT_PUBLIC_API_URL:"
    grep "NEXT_PUBLIC_API_URL" deploy/docker-compose.prod.yml | head -1
fi

echo ""
echo "✅ IP 配置完成！"
