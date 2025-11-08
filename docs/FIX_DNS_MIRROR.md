# 解决镜像源 DNS 解析失败

如果镜像源地址无法解析，需要更换可用的镜像源。

## 🔧 快速修复

### 方法一：使用腾讯云镜像（推荐）

```bash
# 配置腾讯云镜像
sudo mkdir -p /etc/docker
cat <<'EOF' | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证
docker info | grep -A 5 "Registry Mirrors"
```

### 方法二：使用多个备用镜像源

```bash
sudo mkdir -p /etc/docker
cat <<'EOF' | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://dockerhub.azk8s.cn",
    "https://reg-mirror.qiniu.com"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 方法三：使用阿里云专属镜像加速器（如果有）

1. 登录阿里云控制台
2. 进入容器镜像服务：https://cr.console.aliyun.com
3. 点击左侧 **镜像加速器**
4. 复制你的专属加速地址

```bash
# 替换为你的专属地址
sudo mkdir -p /etc/docker
cat <<'EOF' | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://你的专属地址.mirror.aliyuncs.com"
  ]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 方法四：不使用镜像源（直接连接 Docker Hub）

如果镜像源都不可用，可以暂时不使用镜像源：

```bash
# 删除或备份现有配置
sudo mv /etc/docker/daemon.json /etc/docker/daemon.json.bak

# 重启 Docker
sudo systemctl restart docker

# 直接连接 Docker Hub（可能较慢）
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
```

## 📋 修复 REDIS_PASSWORD 警告

这个警告可以忽略，因为密码会从 secrets 文件读取。如果想消除警告：

```bash
# 设置环境变量
export REDIS_PASSWORD=$(cat ~/fidoo-blog/secrets/redis_password.txt)

# 然后构建
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
```

## ✅ 完整操作流程

```bash
# 1. 配置镜像源（使用腾讯云）
sudo mkdir -p /etc/docker
cat <<'EOF' | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF

# 2. 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker

# 3. 验证配置
docker info | grep -A 5 "Registry Mirrors"

# 4. 进入项目目录
cd ~/fidoo-blog

# 5. 拉取最新代码（修复 version 警告）
git pull

# 6. 构建镜像
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# 7. 启动服务
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔍 测试镜像源

```bash
# 测试镜像源是否可用
docker pull hello-world

# 如果成功，说明镜像源配置正确
```

---

**推荐**：使用方法一（腾讯云镜像），通常最稳定。

