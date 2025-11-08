# 快速修复权限问题

## 🔧 在服务器上执行

### 方法一：修复权限（如果文件存在）

```bash
# 停止可能正在运行的 docker-compose 进程
sudo pkill -f docker-compose

# 修复权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

### 方法二：使用 docker compose（推荐，新版本）

Docker 新版本内置了 compose 命令，无需单独安装：

```bash
# 直接使用 docker compose（注意是空格）
docker compose version

# 如果可用，继续部署（脚本已更新支持）
cd ~/fidoo-blog
./scripts/deploy.sh production
```

### 方法三：重新安装 docker-compose

```bash
# 删除旧文件
sudo rm -f /usr/local/bin/docker-compose

# 重新下载安装
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 设置权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

## ✅ 推荐方案

**直接使用 `docker compose`（新版本）**，无需修复权限：

```bash
# 测试
docker compose version

# 如果可用，继续部署
cd ~/fidoo-blog
git pull  # 拉取更新后的脚本
./scripts/deploy.sh production
```

部署脚本已更新，会自动检测并使用 `docker compose` 或 `docker-compose`。

---

**最快方法**：执行 `docker compose version`，如果可用，直接继续部署即可。

