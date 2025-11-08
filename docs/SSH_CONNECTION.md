# SSH 连接服务器指南

本文档说明如何通过 SSH 连接到阿里云服务器。

## 🔑 连接信息

- **服务器 IP**: 120.55.3.205
- **端口**: 22（默认）
- **用户名**: root（或其他配置的用户名）

## 📋 连接方式

### 方式一：使用密码连接（首次连接）

```bash
# 基本连接命令
ssh root@120.55.3.205

# 如果端口不是 22，使用 -p 参数
ssh -p 22 root@120.55.3.205
```

**首次连接时会提示：**
```
The authenticity of host '120.55.3.205 (120.55.3.205)' can't be established.
ECDSA key fingerprint is SHA256:xxxxx.
Are you sure you want to continue connecting (yes/no)?
```

输入 `yes` 继续。

### 方式二：使用 SSH 密钥连接（推荐，更安全）

#### 1. 生成 SSH 密钥对（如果还没有）

```bash
# 在本地 Mac 上生成密钥对
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 按提示操作：
# - 保存位置：直接回车使用默认位置 (~/.ssh/id_rsa)
# - 密码：可以设置密码或直接回车（不设置密码）
```

#### 2. 将公钥复制到服务器

```bash
# 方法1: 使用 ssh-copy-id（最简单）
ssh-copy-id root@120.55.3.205

# 方法2: 手动复制
cat ~/.ssh/id_rsa.pub | ssh root@120.55.3.205 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

#### 3. 使用密钥连接

```bash
# 连接时会自动使用密钥，无需输入密码
ssh root@120.55.3.205
```

### 方式三：配置 SSH 别名（方便使用）

创建或编辑 `~/.ssh/config` 文件：

```bash
# 编辑 SSH 配置文件
vim ~/.ssh/config
```

添加以下内容：

```
Host aliyun
    HostName 120.55.3.205
    User root
    Port 22
    IdentityFile ~/.ssh/id_rsa
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

保存后，就可以使用别名连接：

```bash
# 使用别名连接
ssh aliyun
```

## 🔧 常见问题解决

### 1. 连接超时

**问题**: `Connection timed out`

**解决方法**:
```bash
# 检查服务器是否开启 SSH 服务
# 在阿里云控制台检查：
# 1. 安全组规则是否开放 22 端口
# 2. 服务器防火墙是否允许 SSH

# 测试端口是否开放
telnet 120.55.3.205 22
# 或
nc -zv 120.55.3.205 22
```

### 2. 权限被拒绝

**问题**: `Permission denied (publickey,password)`

**解决方法**:
```bash
# 1. 确认用户名正确（可能是 ubuntu、root 或其他）
ssh ubuntu@120.55.3.205
ssh root@120.55.3.205

# 2. 检查密钥权限
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub

# 3. 使用密码连接
ssh -o PreferredAuthentications=password root@120.55.3.205
```

### 3. 忘记密码

如果忘记密码，可以通过阿里云控制台重置：

1. 登录阿里云控制台
2. 进入 ECS 实例管理
3. 选择你的服务器实例
4. 点击"重置实例密码"
5. 设置新密码后重启服务器

### 4. 首次连接需要确认指纹

```bash
# 如果担心安全问题，可以先验证指纹
ssh-keyscan 120.55.3.205

# 然后手动添加到 known_hosts
ssh-keyscan -H 120.55.3.205 >> ~/.ssh/known_hosts
```

## 🔐 安全建议

### 1. 禁用密码登录（使用密钥后）

连接服务器后，编辑 SSH 配置：

```bash
# 编辑 SSH 配置文件
sudo vim /etc/ssh/sshd_config

# 修改以下配置
PasswordAuthentication no
PubkeyAuthentication yes

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 2. 修改默认端口（可选）

```bash
# 编辑 SSH 配置
sudo vim /etc/ssh/sshd_config

# 修改端口（例如改为 2222）
Port 2222

# 重启服务
sudo systemctl restart sshd

# 连接时指定端口
ssh -p 2222 root@120.55.3.205
```

### 3. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

## 📝 快速连接命令

### 基本连接
```bash
ssh root@120.55.3.205
```

### 带端口
```bash
ssh -p 22 root@120.55.3.205
```

### 执行远程命令（不进入交互式 shell）
```bash
ssh root@120.55.3.205 "ls -la"
ssh root@120.55.3.205 "docker --version"
```

### 传输文件

```bash
# 上传文件到服务器
scp local_file.txt root@120.55.3.205:/root/

# 下载文件到本地
scp root@120.55.3.205:/root/file.txt ./

# 传输目录
scp -r local_dir root@120.55.3.205:/root/
```

## 🚀 连接后立即部署

连接成功后，可以立即开始部署：

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. 克隆项目
git clone https://github.com/fidoong/fidoo-blog.git
cd fidoo-blog

# 5. 部署
chmod +x scripts/*.sh
./scripts/setup-secrets.sh
./scripts/deploy.sh production
```

## 📚 相关文档

- [快速部署指南](./QUICK_DEPLOY.md)
- [IP 部署指南](./DEPLOY_WITH_IP.md)
- [企业级部署指南](./ENTERPRISE_DEPLOYMENT.md)

---

**提示**: 如果遇到连接问题，请检查：
1. 阿里云安全组是否开放 22 端口
2. 服务器防火墙配置
3. SSH 服务是否运行
4. 用户名和密码是否正确

