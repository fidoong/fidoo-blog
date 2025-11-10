#!/bin/bash
# 修复 Docker 服务启动失败

echo "🔧 修复 Docker 服务..."

# 1. 查看错误详情
echo "查看 Docker 服务状态..."
systemctl status docker.service

echo ""
echo "查看详细错误日志..."
journalctl -xeu docker.service --no-pager | tail -30

# 2. 检查 daemon.json 配置
echo ""
echo "检查 daemon.json 配置..."
cat /etc/docker/daemon.json

# 3. 验证 JSON 格式
echo ""
echo "验证 JSON 格式..."
python3 -m json.tool /etc/docker/daemon.json 2>/dev/null || echo "⚠️  JSON 格式可能有问题"

# 4. 修复 daemon.json（确保格式正确）
echo ""
echo "修复 daemon.json..."
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://ew8sweml.mirror.aliyuncs.com"
  ],
  "max-concurrent-downloads": 10
}
EOF

# 5. 验证 JSON
python3 -m json.tool /etc/docker/daemon.json

# 6. 重启 Docker
echo ""
echo "重启 Docker..."
systemctl daemon-reload
systemctl restart docker

# 7. 等待启动
sleep 5

# 8. 检查状态
systemctl status docker.service --no-pager -l

# 9. 如果还是失败，尝试重置
if ! systemctl is-active --quiet docker; then
    echo ""
    echo "⚠️  Docker 启动失败，尝试重置..."
    
    # 停止所有 Docker 进程
    pkill -9 dockerd || true
    pkill -9 docker-containerd || true
    
    # 清理可能的锁文件
    rm -f /var/run/docker.pid
    rm -f /var/run/docker.sock
    
    # 重新启动
    systemctl daemon-reload
    systemctl start docker
    sleep 5
    
    systemctl status docker.service --no-pager -l
fi

echo ""
if systemctl is-active --quiet docker; then
    echo "✅ Docker 服务已启动"
    docker info | grep -A 3 "Registry Mirrors"
else
    echo "❌ Docker 服务启动失败，请查看上面的错误信息"
fi
