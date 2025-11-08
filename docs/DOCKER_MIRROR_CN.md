# Docker 镜像加速配置（国内）

如果下载 Docker 镜像速度慢，配置国内镜像源可以大幅提升速度。

## 🚀 快速配置（推荐）

### 方法一：配置阿里云镜像加速器

1. **登录阿里云控制台**
   - 进入容器镜像服务：https://cr.console.aliyun.com
   - 点击左侧 **镜像加速器**
   - 复制你的专属加速地址（格式类似：`https://xxxxx.mirror.aliyuncs.com`）

2. **在服务器上配置**

```bash
# 创建或编辑 Docker daemon 配置
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://xxxxx.mirror.aliyuncs.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
EOF

# 重启 Docker 服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info | grep -A 10 "Registry Mirrors"
```

### 方法二：使用通用镜像源（无需注册）

```bash
# 创建或编辑 Docker daemon 配置
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
EOF

# 重启 Docker 服务
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info | grep -A 10 "Registry Mirrors"
```

## 📋 常用国内镜像源

- **中科大镜像**: `https://docker.mirrors.ustc.edu.cn`
- **网易镜像**: `https://hub-mirror.c.163.com`
- **百度云镜像**: `https://mirror.baidubce.com`
- **阿里云镜像**: `https://xxxxx.mirror.aliyuncs.com`（需要注册）
- **腾讯云镜像**: `https://mirror.ccs.tencentyun.com`

## ✅ 配置后继续部署

配置完成后，继续执行部署：

```bash
# 继续部署（会使用新的镜像源）
cd ~/fidoo-blog
./scripts/deploy.sh production
```

## 🔍 验证镜像加速

```bash
# 查看配置的镜像源
docker info | grep -A 10 "Registry Mirrors"

# 测试下载速度（下载一个小镜像）
time docker pull hello-world
```

## 🆘 如果配置后还是慢

### 检查配置

```bash
# 检查配置文件
cat /etc/docker/daemon.json

# 检查 Docker 服务状态
sudo systemctl status docker

# 重启 Docker
sudo systemctl restart docker
```

### 使用代理（如果有）

如果有代理服务器，可以配置：

```bash
# 创建 Docker 代理配置
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf <<-'EOF'
[Service]
Environment="HTTP_PROXY=http://proxy.example.com:8080"
Environment="HTTPS_PROXY=http://proxy.example.com:8080"
Environment="NO_PROXY=localhost,127.0.0.1"
EOF

# 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 💡 临时解决方案

如果不想配置镜像源，可以：

1. **等待下载完成**（虽然慢，但最终会完成）
2. **使用 Ctrl+C 中断，稍后重试**（Docker 支持断点续传）
3. **在非高峰时段下载**（晚上或凌晨速度可能更快）

---

**推荐**：使用方法二（通用镜像源），无需注册，配置简单，速度提升明显。
