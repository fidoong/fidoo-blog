# Docker 已安装处理指南

如果系统提示 Docker 已经存在，按以下步骤处理。

## ✅ 检查 Docker 是否可用

### 1. 检查 Docker 版本

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker 是否运行
sudo systemctl status docker

# 如果未运行，启动 Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 检查 Docker Compose

```bash
# 检查 Docker Compose 版本
docker-compose --version

# 如果没有安装，安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 3. 测试 Docker

```bash
# 测试 Docker 是否正常工作
sudo docker run hello-world

# 如果提示权限错误，将用户添加到 docker 组
sudo usermod -aG docker $USER
newgrp docker

# 再次测试（不需要 sudo）
docker run hello-world
```

## 🔧 如果 Docker 已安装但无法使用

### 方法一：跳过安装，直接使用

如果 Docker 已经安装且可用，可以：

1. **按 Ctrl+C 取消安装脚本**
2. **直接使用现有 Docker**

```bash
# 检查 Docker 状态
sudo systemctl status docker

# 如果未运行，启动它
sudo systemctl start docker
sudo systemctl enable docker

# 将用户添加到 docker 组（如果还没添加）
sudo usermod -aG docker $USER
newgrp docker

# 验证
docker --version
docker ps
```

### 方法二：继续安装（更新 Docker）

如果想更新到最新版本：

1. **等待 20 秒**（脚本会自动继续）
2. **或按回车继续安装**

安装完成后验证：

```bash
docker --version
sudo systemctl restart docker
```

## 📋 继续部署步骤

确认 Docker 可用后，继续部署：

```bash
# 1. 安装 Docker Compose（如果还没有）
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

# 2. 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable

# 3. 克隆项目
git clone https://github.com/fidoong/fidoo-blog.git
cd fidoo-blog

# 4. 生成密钥并部署
chmod +x scripts/*.sh
./scripts/setup-secrets.sh
./scripts/deploy.sh production
```

## ✅ 快速检查清单

执行以下命令确认环境：

```bash
# 检查 Docker
docker --version
docker ps

# 检查 Docker Compose
docker-compose --version

# 检查用户权限
groups | grep docker

# 如果 groups 中没有 docker，执行：
sudo usermod -aG docker $USER
newgrp docker
```

## 🆘 常见问题

### 问题 1: Permission denied

```bash
# 解决方案：将用户添加到 docker 组
sudo usermod -aG docker $USER
newgrp docker

# 或使用 sudo（临时）
sudo docker ps
```

### 问题 2: Docker daemon not running

```bash
# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 检查状态
sudo systemctl status docker
```

### 问题 3: Cannot connect to Docker daemon

```bash
# 重启 Docker 服务
sudo systemctl restart docker

# 检查 Docker socket 权限
ls -la /var/run/docker.sock
```

---

**建议**：如果 Docker 已经安装且可用，按 Ctrl+C 取消安装脚本，直接使用现有 Docker 继续部署。

