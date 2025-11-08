# 阿里云服务器部署方案

本项目已提供完整的企业级部署方案，适用于阿里云服务器部署。

## 📚 文档

- **[快速部署指南](./docs/QUICK_DEPLOY.md)** - 适合快速上手的简化部署步骤
- **[企业级部署指南](./docs/ENTERPRISE_DEPLOYMENT.md)** - 完整的企业级部署方案，包含安全、监控、备份等

## 🚀 快速开始

### 1. 准备服务器

- 操作系统: Ubuntu 22.04 LTS（推荐）
- 配置: 2核4G 或更高
- 开放端口: 22, 80, 443

### 2. 安装环境

```bash
# 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 部署项目

```bash
# 克隆项目
git clone https://github.com/fidoo/fidoo-blog.git
cd fidoo-blog

# 生成密钥
chmod +x scripts/*.sh
./scripts/setup-secrets.sh

# 配置环境变量
cp service/env.example service/.env.production
vim service/.env.production  # 修改域名等配置

# 部署
./scripts/deploy.sh production
```

### 4. 初始化数据库

```bash
docker-compose exec service sh -c "cd /app && npm run migration:run"
```

## 📋 部署文件说明

### 核心文件

- `docker-compose.yml` - 基础 Docker Compose 配置
- `docker-compose.prod.yml` - 生产环境覆盖配置
- `docker/nginx/nginx.prod.conf` - 生产环境 Nginx 配置（支持 HTTPS）

### 部署脚本

- `scripts/deploy.sh` - 一键部署脚本
- `scripts/backup.sh` - 备份脚本
- `scripts/monitor.sh` - 监控脚本
- `scripts/setup-secrets.sh` - 密钥生成脚本

### 使用示例

```bash
# 部署
./scripts/deploy.sh production

# 备份
./scripts/backup.sh full

# 监控
./scripts/monitor.sh status
./scripts/monitor.sh health
./scripts/monitor.sh logs
```

## 🔒 安全配置

### SSL 证书

推荐使用 Let's Encrypt 免费证书：

```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### 密钥管理

所有密钥文件保存在 `secrets/` 目录，已配置 `.gitignore` 防止提交到版本控制。

## 📊 监控和维护

### 日常维护

```bash
# 查看服务状态
./scripts/monitor.sh status

# 健康检查
./scripts/monitor.sh health

# 查看日志
./scripts/monitor.sh logs
```

### 备份策略

```bash
# 手动备份
./scripts/backup.sh full

# 配置自动备份（Cron）
0 2 * * * cd /path/to/fidoo-blog && ./scripts/backup.sh full
```

## 🆘 获取帮助

- 详细文档: [企业级部署指南](./docs/ENTERPRISE_DEPLOYMENT.md)
- GitHub Issues: https://github.com/fidoo/fidoo-blog/issues

