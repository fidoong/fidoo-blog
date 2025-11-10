# 阿里云 ECS 服务器部署步骤

## 📋 前置检查

### 1. 检查系统信息
```bash
# 查看系统版本
cat /etc/os-release

# 查看系统资源
free -h
df -h
```

### 2. 获取公网 IP
```bash
# 查看公网 IP
curl ifconfig.me
# 或
curl ip.sb
```

记录下你的公网 IP，后续会用到。

## 🚀 完整部署流程

### 步骤 1: 安装 Docker 和 Docker Compose

```bash
# 更新系统包
apt update && apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 启动 Docker 服务
systemctl start docker
systemctl enable docker

# 验证 Docker 安装
docker --version

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证 Docker Compose 安装
docker-compose --version
```

### 步骤 2: 安装 Git（如果还没有）

```bash
apt install -y git
git --version
```

### 步骤 3: 克隆项目

```bash
# 进入 /opt 目录
cd /opt

# 克隆项目（替换为你的仓库地址）
git clone https://github.com/your-username/fidoo-blog.git
# 或使用 SSH
# git clone git@github.com:your-username/fidoo-blog.git

# 进入项目目录
cd fidoo-blog
```

### 步骤 4: 配置 IP 地址

```bash
# 获取你的公网 IP（如果还不知道）
SERVER_IP=$(curl -s ifconfig.me)
echo "你的公网 IP: $SERVER_IP"

# 使用快速配置脚本
chmod +x scripts/*.sh
./scripts/config-ip.sh $SERVER_IP

# 或者手动设置（如果脚本不可用）
# 编辑配置文件
# vim service/.env.production
# 将 YOUR_SERVER_IP 替换为实际 IP
```

### 步骤 5: 配置防火墙

```bash
# 安装 ufw（如果还没有）
apt install -y ufw

# 开放必要端口
ufw allow 22/tcp    # SSH
ufw allow 3000/tcp   # 前台网站
ufw allow 3001/tcp   # 后台管理
ufw allow 3005/tcp   # 后端 API

# 启用防火墙
ufw enable

# 查看防火墙状态
ufw status
```

### 步骤 6: 部署服务

```bash
# 使用部署脚本（推荐）
./scripts/deploy.sh docker production

# 或者手动部署
docker-compose -f deploy/docker-compose.prod.yml build
docker-compose -f deploy/docker-compose.prod.yml up -d
```

### 步骤 7: 等待服务启动

```bash
# 等待约 30 秒让服务完全启动
sleep 30

# 查看服务状态
docker-compose -f deploy/docker-compose.prod.yml ps

# 查看日志
docker-compose -f deploy/docker-compose.prod.yml logs -f
```

### 步骤 8: 运行数据库迁移

```bash
# 运行数据库迁移
docker-compose -f deploy/docker-compose.prod.yml exec service sh -c "cd /app/service && pnpm migration:run"

# 可选：运行种子数据（初始化数据）
docker-compose -f deploy/docker-compose.prod.yml exec service sh -c "cd /app/service && pnpm seed"
```

### 步骤 9: 验证部署

```bash
# 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me)

# 测试服务
curl http://localhost:3005/health  # 后端健康检查
curl http://localhost:3000         # 前台网站
curl http://localhost:3001         # 后台管理

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  前台网站:  http://$SERVER_IP:3000"
echo "  后台管理:  http://$SERVER_IP:3001"
echo "  后端 API:  http://$SERVER_IP:3005/api"
echo "  API 文档:  http://$SERVER_IP:3005/api/docs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## 🔧 常用管理命令

### 查看服务状态
```bash
docker-compose -f deploy/docker-compose.prod.yml ps
```

### 查看日志
```bash
# 所有服务日志
docker-compose -f deploy/docker-compose.prod.yml logs -f

# 特定服务日志
docker-compose -f deploy/docker-compose.prod.yml logs -f service
docker-compose -f deploy/docker-compose.prod.yml logs -f web
docker-compose -f deploy/docker-compose.prod.yml logs -f admin
```

### 重启服务
```bash
docker-compose -f deploy/docker-compose.prod.yml restart
```

### 停止服务
```bash
docker-compose -f deploy/docker-compose.prod.yml down
```

### 更新部署
```bash
cd /opt/fidoo-blog
git pull
docker-compose -f deploy/docker-compose.prod.yml build
docker-compose -f deploy/docker-compose.prod.yml up -d

# 运行数据库迁移（如有）
docker-compose -f deploy/docker-compose.prod.yml exec service sh -c "cd /app/service && pnpm migration:run"
```

## 🐛 故障排查

### 服务无法启动
```bash
# 查看容器状态
docker-compose -f deploy/docker-compose.prod.yml ps

# 查看详细日志
docker-compose -f deploy/docker-compose.prod.yml logs

# 检查端口占用
netstat -tulpn | grep :3000
netstat -tulpn | grep :3005
```

### 数据库连接失败
```bash
# 测试数据库连接
docker-compose -f deploy/docker-compose.prod.yml exec postgres psql -U postgres -d fidoo_blog

# 检查环境变量
docker-compose -f deploy/docker-compose.prod.yml exec service env | grep DB_
```

### 磁盘空间不足
```bash
# 查看磁盘使用
df -h

# 清理 Docker 未使用的资源
docker system prune -a
```

## 📝 一键部署脚本

你也可以创建一个一键部署脚本：

```bash
#!/bin/bash
# 一键部署脚本

set -e

echo "🚀 开始部署 Fidoo Blog..."

# 1. 安装 Docker
if ! command -v docker &> /dev/null; then
    echo "📦 安装 Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
fi

# 2. 安装 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 3. 克隆项目
if [ ! -d "/opt/fidoo-blog" ]; then
    echo "📥 克隆项目..."
    cd /opt
    git clone https://github.com/your-username/fidoo-blog.git
fi

# 4. 配置 IP
cd /opt/fidoo-blog
SERVER_IP=$(curl -s ifconfig.me)
echo "🔧 配置 IP: $SERVER_IP"
chmod +x scripts/*.sh
./scripts/config-ip.sh $SERVER_IP

# 5. 配置防火墙
echo "🔥 配置防火墙..."
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw allow 3005/tcp
ufw --force enable

# 6. 部署服务
echo "🚀 部署服务..."
./scripts/deploy.sh docker production

# 7. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 8. 运行数据库迁移
echo "🗄️  运行数据库迁移..."
docker-compose -f deploy/docker-compose.prod.yml exec -T service sh -c "cd /app/service && pnpm migration:run" || echo "迁移可能已运行"

echo ""
echo "✅ 部署完成！"
echo "访问地址: http://$SERVER_IP:3000"
```

保存为 `deploy.sh`，然后执行：
```bash
chmod +x deploy.sh
./deploy.sh
```

