# 使用国内镜像仓库解决网络问题

如果 Docker Hub 镜像源都不可用，可以直接在 Dockerfile 中使用国内镜像仓库。

## 🔧 方法一：修改 Dockerfile 使用国内镜像

### 在服务器上修改 Dockerfile

```bash
cd ~/fidoo-blog

# 备份原文件
cp service/Dockerfile service/Dockerfile.bak
cp web/Dockerfile web/Dockerfile.bak
cp admin/Dockerfile admin/Dockerfile.bak
```

### 修改 service/Dockerfile

```bash
# 编辑文件
vim service/Dockerfile
```

将第一行改为：
```dockerfile
FROM registry.cn-hangzhou.aliyuncs.com/acs/node:18-alpine AS builder
```

或者使用其他国内镜像：
```dockerfile
FROM dockerhub.azk8s.cn/library/node:18-alpine AS builder
```

### 修改 web/Dockerfile 和 admin/Dockerfile

同样修改第一行和第二个 FROM 语句。

## 🔧 方法二：使用环境变量（推荐）

在构建时指定镜像前缀：

```bash
cd ~/fidoo-blog

# 使用阿里云镜像构建
DOCKER_BUILDKIT=1 docker compose -f docker-compose.yml -f docker-compose.prod.yml build \
  --build-arg NODE_IMAGE=registry.cn-hangzhou.aliyuncs.com/acs/node:18-alpine \
  --no-cache
```

## 🔧 方法三：配置代理（如果有）

如果有代理服务器：

```bash
# 配置 Docker 代理
sudo mkdir -p /etc/systemd/system/docker.service.d
cat <<'EOF' | sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf
[Service]
Environment="HTTP_PROXY=http://proxy.example.com:8080"
Environment="HTTPS_PROXY=http://proxy.example.com:8080"
Environment="NO_PROXY=localhost,127.0.0.1"
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 🔧 方法四：手动拉取镜像后构建

```bash
# 1. 尝试从不同源拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/acs/node:18-alpine

# 2. 如果成功，给镜像打标签
docker tag registry.cn-hangzhou.aliyuncs.com/acs/node:18-alpine node:18-alpine

# 3. 然后构建
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
```

## ✅ 推荐操作

**最简单的方法**：配置镜像源后，增加超时时间：

```bash
# 配置镜像源和超时
sudo mkdir -p /etc/docker
cat <<'EOF' | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://dockerhub.azk8s.cn",
    "https://reg-mirror.qiniu.com"
  ],
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 5
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker

# 测试
docker pull hello-world

# 如果成功，继续构建
cd ~/fidoo-blog
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
```

---

**如果所有方法都不行**，可以考虑：
1. 在本地构建镜像后上传
2. 使用阿里云容器镜像服务
3. 等待网络恢复后重试

