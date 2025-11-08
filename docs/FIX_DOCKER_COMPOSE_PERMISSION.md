# 修复 Docker Compose 权限问题

如果遇到 `Permission denied` 错误，执行以下命令修复。

## 🔧 快速修复

在服务器上执行：

```bash
# 修复 docker-compose 权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

## 📋 完整修复步骤

### 方法一：修复权限（推荐）

```bash
# 1. 修复权限
sudo chmod +x /usr/local/bin/docker-compose

# 2. 验证
docker-compose --version

# 3. 如果还是不行，检查文件是否存在
ls -la /usr/local/bin/docker-compose

# 4. 如果文件不存在，重新安装
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 方法二：使用 docker compose（新版本）

Docker 新版本内置了 compose 命令：

```bash
# 使用 docker compose（注意是空格，不是横线）
docker compose version

# 如果可用，可以创建别名
echo 'alias docker-compose="docker compose"' >> ~/.bashrc
source ~/.bashrc
```

### 方法三：检查 PATH

```bash
# 检查 PATH 是否包含 /usr/local/bin
echo $PATH

# 如果不在 PATH 中，添加到 PATH
export PATH=$PATH:/usr/local/bin

# 永久添加到 PATH
echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
source ~/.bashrc
```

## ✅ 修复后继续部署

修复权限后，继续执行部署：

```bash
# 继续部署
./scripts/deploy.sh production
```

## 🆘 如果还是不行

### 检查 Docker Compose 安装

```bash
# 检查文件是否存在
which docker-compose
ls -la /usr/local/bin/docker-compose

# 重新安装
sudo rm /usr/local/bin/docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

### 使用替代命令

如果 docker-compose 一直有问题，可以直接使用 docker compose 命令：

```bash
# 修改部署脚本使用 docker compose
# 或者直接使用 docker compose 命令
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

**快速修复**：执行 `sudo chmod +x /usr/local/bin/docker-compose` 然后继续部署。

