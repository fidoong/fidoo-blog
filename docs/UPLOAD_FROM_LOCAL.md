# 从本地上传项目到服务器

如果网络有问题无法使用 git clone，可以从本地上传项目文件。

## 📦 方法一：使用 scp 上传（推荐）

### 步骤 1: 在本地打包项目

```bash
# 在项目根目录执行
cd /Users/fidoo/Desktop/github/fidoo-blog

# 创建部署包（排除不需要的文件）
tar czf fidoo-blog-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.turbo' \
  --exclude='secrets' \
  --exclude='backups' \
  --exclude='docker/nginx/ssl' \
  --exclude='.env*' \
  --exclude='*.log' \
  --exclude='.git' \
  --exclude='*.md' \
  .
```

### 步骤 2: 上传到服务器

```bash
# 上传压缩包到服务器
scp fidoo-blog-deploy.tar.gz root@120.55.3.205:/root/

# 如果使用密钥连接
scp -i ~/.ssh/id_ed25519 fidoo-blog-deploy.tar.gz root@120.55.3.205:/root/
```

### 步骤 3: 在服务器上解压

```bash
# SSH 连接到服务器
ssh root@120.55.3.205

# 解压文件
cd /root
tar xzf fidoo-blog-deploy.tar.gz -C fidoo-blog

# 或直接解压到当前目录
tar xzf fidoo-blog-deploy.tar.gz
mv fidoo-blog-deploy fidoo-blog
cd fidoo-blog
```

## 📦 方法二：使用 rsync 同步（适合大文件）

### 在本地执行

```bash
# 同步项目文件到服务器（排除不需要的文件）
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.turbo' \
  --exclude='secrets' \
  --exclude='backups' \
  --exclude='docker/nginx/ssl' \
  --exclude='.env*' \
  --exclude='*.log' \
  --exclude='.git' \
  /Users/fidoo/Desktop/github/fidoo-blog/ \
  root@120.55.3.205:/root/fidoo-blog/
```

## 📦 方法三：使用 zip 压缩（Windows 友好）

### 在本地执行

```bash
# 创建 zip 压缩包
cd /Users/fidoo/Desktop/github/fidoo-blog
zip -r fidoo-blog-deploy.zip . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x "dist/*" \
  -x ".turbo/*" \
  -x "secrets/*" \
  -x "backups/*" \
  -x "docker/nginx/ssl/*" \
  -x ".env*" \
  -x "*.log" \
  -x ".git/*"

# 上传到服务器
scp fidoo-blog-deploy.zip root@120.55.3.205:/root/
```

### 在服务器上解压

```bash
# 安装 unzip（如果没有）
sudo apt install unzip -y

# 解压
cd /root
unzip fidoo-blog-deploy.zip -d fidoo-blog
cd fidoo-blog
```

## 🚀 上传后的部署步骤

文件上传到服务器后，继续执行：

```bash
# 1. 进入项目目录
cd /root/fidoo-blog

# 2. 生成密钥并部署
chmod +x scripts/*.sh
./scripts/setup-secrets.sh
./scripts/deploy.sh production

# 3. 等待服务启动并初始化数据库
sleep 30
docker-compose exec service sh -c "cd /app && npm run migration:run"

# 4. 验证部署
./scripts/monitor.sh status
```

## 📋 需要上传的文件清单

确保以下文件/目录已上传：

- ✅ `docker-compose.yml`
- ✅ `docker-compose.prod.yml`
- ✅ `docker/nginx/nginx.ip.conf`
- ✅ `scripts/` 目录（所有脚本）
- ✅ `service/` 目录（后端代码）
- ✅ `web/` 目录（前端代码）
- ✅ `admin/` 目录（管理后台代码）
- ✅ `packages/shared/` 目录（共享包）
- ✅ `package.json`
- ✅ `pnpm-workspace.yaml`
- ✅ `pnpm-lock.yaml`
- ✅ `turbo.json`

## 🔧 快速上传脚本

在本地创建上传脚本：

```bash
# 创建 upload.sh
cat > upload.sh << 'EOF'
#!/bin/bash

# 打包项目
echo "正在打包项目..."
tar czf fidoo-blog-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.turbo' \
  --exclude='secrets' \
  --exclude='backups' \
  --exclude='docker/nginx/ssl' \
  --exclude='.env*' \
  --exclude='*.log' \
  --exclude='.git' \
  .

# 上传到服务器
echo "正在上传到服务器..."
scp fidoo-blog-deploy.tar.gz root@120.55.3.205:/root/

echo "上传完成！"
echo "在服务器上执行："
echo "  cd /root && tar xzf fidoo-blog-deploy.tar.gz -C fidoo-blog && cd fidoo-blog"
EOF

chmod +x upload.sh
./upload.sh
```

## ⚠️ 注意事项

1. **文件大小**：确保上传的文件不超过服务器磁盘空间
2. **权限问题**：上传后检查文件权限
3. **敏感文件**：不要上传 `secrets/` 目录，在服务器上生成
4. **环境变量**：不要上传 `.env` 文件，在服务器上配置

## 🆘 如果上传失败

### 检查网络连接

```bash
# 测试服务器连接
ping 120.55.3.205

# 测试 SSH 连接
ssh root@120.55.3.205 "echo '连接成功'"
```

### 使用断点续传

```bash
# 使用 rsync 支持断点续传
rsync -avz --partial --progress \
  --exclude='node_modules' \
  --exclude='.next' \
  /Users/fidoo/Desktop/github/fidoo-blog/ \
  root@120.55.3.205:/root/fidoo-blog/
```

---

**推荐方法**：使用方法一（tar + scp），简单可靠。

