# 解决网络超时问题

如果遇到网络超时无法下载 Docker 镜像，需要配置国内镜像加速。

## 🚀 快速配置镜像加速

在服务器上执行以下命令：

```bash
# 1. 配置国内镜像源
sudo mkdir -p /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF

# 2. 重启 Docker 服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 3. 验证配置
docker info | grep -A 10 "Registry Mirrors"
```

## 📋 配置完成后重新构建

```bash
cd ~/fidoo-blog

# 重新构建镜像
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# 启动服务
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔧 修复 Redis 密码警告

如果看到 `REDIS_PASSWORD` 变量未设置的警告，这是正常的，因为密码从 secrets 文件读取。

如果需要设置环境变量，可以：

```bash
# 在服务器上设置环境变量（从 secrets 文件读取）
export REDIS_PASSWORD=$(cat ~/fidoo-blog/secrets/redis_password.txt)

# 然后重新部署
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

或者直接忽略这个警告，因为密码会从 secrets 文件自动读取。

## ✅ 完整部署流程

```bash
# 1. 配置镜像加速
sudo mkdir -p /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF
sudo systemctl restart docker

# 2. 进入项目目录
cd ~/fidoo-blog

# 3. 构建镜像
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# 4. 启动服务
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 5. 等待服务启动
sleep 30

# 6. 运行数据库迁移
docker compose exec service sh -c "cd /app && npm run migration:run"

# 7. 检查状态
docker compose ps
```

---

**重要**：配置镜像加速后，下载速度会大幅提升！
