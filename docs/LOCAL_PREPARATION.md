# 本地准备工作指南

在部署到阿里云服务器之前，请在本地完成以下准备工作。

## 📋 检查清单

### 1. 验证配置文件

确保以下文件已创建并配置正确：

```bash
# 检查关键文件
ls -la docker-compose.prod.yml
ls -la docker/nginx/nginx.prod.conf
ls -la scripts/deploy.sh
ls -la scripts/backup.sh
ls -la scripts/monitor.sh
ls -la scripts/setup-secrets.sh
```

### 2. 检查脚本权限

```bash
# 确保脚本有执行权限
chmod +x scripts/*.sh

# 验证权限
ls -l scripts/*.sh
```

### 3. 验证 Docker Compose 配置

```bash
# 检查基础配置
docker-compose config

# 检查生产环境配置（需要先设置环境变量）
docker-compose -f docker-compose.yml -f docker-compose.prod.yml config
```

## 🔧 本地准备工作

### 步骤 1: 更新 .gitignore

确保敏感文件不会被提交：

```bash
# 检查 .gitignore 是否包含敏感文件
cat .gitignore | grep -E "secrets|backups|ssl|\.env"
```

### 步骤 2: 准备环境变量模板

```bash
# 复制环境变量模板（不要提交实际值）
cp service/env.example service/.env.production.example

# 编辑模板，添加注释说明需要修改的值
vim service/.env.production.example
```

关键配置项需要修改：

```env
# 必须修改的配置
CORS_ORIGINS=https://www.yourdomain.com,https://admin.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

# 数据库配置（生产环境使用 secrets）
DB_PASSWORD=从 secrets/db_password.txt 读取

# JWT 密钥（生产环境使用 secrets）
JWT_SECRET=从 secrets/jwt_secret.txt 读取
```

### 步骤 3: 更新 Nginx 配置中的域名

```bash
# 编辑 Nginx 配置，替换域名
vim docker/nginx/nginx.prod.conf
```

将所有 `yourdomain.com` 替换为你的实际域名：

- `api.yourdomain.com` → `api.yourdomain.com`
- `www.yourdomain.com` → `www.yourdomain.com`
- `admin.yourdomain.com` → `admin.yourdomain.com`

### 步骤 4: 创建必要的目录结构

```bash
# 创建目录（如果不存在）
mkdir -p secrets
mkdir -p backups
mkdir -p docker/nginx/ssl
mkdir -p docker/nginx/conf.d

# 创建 .gitkeep 文件（用于保留空目录）
touch secrets/.gitkeep
touch docker/nginx/ssl/.gitkeep
```

### 步骤 5: 准备部署文档

确保部署文档完整：

```bash
# 检查文档
ls -la docs/ENTERPRISE_DEPLOYMENT.md
ls -la docs/QUICK_DEPLOY.md
ls -la docs/SERVER_2C2G_OPTIMIZATION.md
```

## 🧪 本地测试（可选）

### 测试 Docker 配置

```bash
# 测试构建（不启动）
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# 检查配置语法
docker-compose -f docker-compose.yml -f docker-compose.prod.yml config > /dev/null && echo "配置正确"
```

### 测试脚本

```bash
# 测试密钥生成脚本
./scripts/setup-secrets.sh

# 检查生成的密钥文件
ls -la secrets/

# 清理测试密钥（不要提交）
rm -rf secrets/*.txt
```

## 📦 准备部署包

### 方式一：使用 Git（推荐）

```bash
# 1. 提交所有更改
git add .
git status  # 检查要提交的文件

# 2. 确保不提交敏感文件
git status | grep -E "secrets|\.env|backups|ssl"

# 3. 提交更改
git commit -m "feat: 添加企业级部署配置和脚本"

# 4. 推送到远程仓库
git push origin main
```

### 方式二：直接上传文件

如果不想使用 Git，可以打包文件：

```bash
# 创建部署包（排除 node_modules 等）
tar czf deployment-package.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.turbo' \
  --exclude='secrets' \
  --exclude='backups' \
  --exclude='docker/nginx/ssl' \
  --exclude='.env*' \
  --exclude='*.log' \
  .
```

## 📝 部署前检查清单

在部署到服务器之前，确认以下事项：

- [ ] 所有配置文件已创建
- [ ] 脚本有执行权限
- [ ] Nginx 配置中的域名已更新
- [ ] 环境变量模板已准备
- [ ] `.gitignore` 已更新，不会提交敏感文件
- [ ] 已准备好 SSL 证书（或计划使用 Let's Encrypt）
- [ ] 已准备好域名 DNS 解析
- [ ] 已阅读部署文档

## 🚀 下一步：服务器部署

完成本地准备后，按照以下步骤在服务器上部署：

1. **连接服务器**

   ```bash
   ssh user@your-server-ip
   ```

2. **克隆项目**（如果使用 Git）

   ```bash
   git clone https://github.com/fidoo/fidoo-blog.git
   cd fidoo-blog
   ```

3. **或上传文件**（如果使用打包方式）

   ```bash
   # 在本地
   scp deployment-package.tar.gz user@your-server-ip:/home/user/

   # 在服务器上
   tar xzf deployment-package.tar.gz
   ```

4. **执行部署**

   ```bash
   # 生成密钥
   ./scripts/setup-secrets.sh

   # 配置环境变量
   cp service/env.example service/.env.production
   vim service/.env.production

   # 部署
   ./scripts/deploy.sh production
   ```

## 🔍 验证清单

部署后验证：

- [ ] 所有服务正常运行
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] API 可以访问
- [ ] 前端可以访问
- [ ] SSL 证书配置正确
- [ ] 监控脚本正常工作

## 📚 相关文档

- [快速部署指南](./QUICK_DEPLOY.md)
- [企业级部署指南](./ENTERPRISE_DEPLOYMENT.md)
- [2核2G 服务器优化说明](./SERVER_2C2G_OPTIMIZATION.md)

---

**提示**: 在本地完成所有准备工作后，再连接到服务器进行部署，可以节省时间并减少错误。
