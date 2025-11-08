# SSH 密钥配置详细步骤

## 🔑 你的 SSH 公钥

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOPx60JQAnR2iExiINvoJIsOEeJ77Q2KIYwdizJxt+kW fidoo@mac
```

## 📋 方法一：通过阿里云控制台重置密码（最简单）

### 步骤 1: 重置实例密码

1. 登录阿里云控制台：https://ecs.console.aliyun.com
2. 进入 **云服务器 ECS** → **实例与镜像** → **实例**
3. 找到你的服务器（IP: 120.55.3.205）
4. 点击服务器名称或 **管理**
5. 在左侧菜单找到 **密码/密钥** 或 **实例设置**
6. 点击 **重置实例密码**
7. 设置新密码（记住这个密码）
8. **重启服务器**（重要！）

### 步骤 2: 使用密码登录

```bash
# 使用密码登录
ssh root@120.55.3.205
# 输入刚才设置的密码
```

### 步骤 3: 在服务器上添加 SSH 公钥

登录成功后，执行以下命令：

```bash
# 创建 .ssh 目录
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加公钥（复制下面的整行命令）
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOPx60JQAnR2iExiINvoJIsOEeJ77Q2KIYwdizJxt+kW fidoo@mac" >> ~/.ssh/authorized_keys

# 设置权限
chmod 600 ~/.ssh/authorized_keys

# 验证
cat ~/.ssh/authorized_keys

# 退出
exit
```

### 步骤 4: 使用密钥连接（无需密码）

```bash
# 现在可以直接连接，无需密码
ssh root@120.55.3.205
```

## 📋 方法二：通过阿里云控制台 VNC 连接

如果找不到密码重置选项，可以使用 VNC 连接：

### 步骤 1: 使用 VNC 连接

1. 在阿里云控制台，找到你的服务器
2. 点击 **远程连接** → **VNC 连接**
3. 输入 VNC 密码（如果首次使用，需要设置）
4. 通过浏览器界面登录服务器

### 步骤 2: 在 VNC 中执行命令

在 VNC 终端中执行：

```bash
# 切换到 root 用户（如果当前不是）
sudo su -

# 创建 .ssh 目录
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加公钥
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOPx60JQAnR2iExiINvoJIsOEeJ77Q2KIYwdizJxt+kW fidoo@mac" >> ~/.ssh/authorized_keys

# 设置权限
chmod 600 ~/.ssh/authorized_keys
```

## 📋 方法三：通过阿里云密钥对服务（如果可用）

1. 登录阿里云控制台
2. 搜索 **密钥对** 或进入 **云服务器 ECS** → **网络与安全** → **密钥对**
3. 点击 **创建密钥对** 或 **导入密钥对**
4. 选择 **导入已有密钥对**
5. 粘贴公钥内容
6. 绑定到你的服务器实例

## 🔧 配置 SSH 别名（可选）

连接成功后，可以配置别名方便使用：

```bash
# 编辑 SSH 配置
vim ~/.ssh/config
```

添加：

```
Host aliyun
    HostName 120.55.3.205
    User root
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
```

保存后使用：

```bash
ssh aliyun
```

## ✅ 验证连接

```bash
# 测试连接（应该无需密码）
ssh root@120.55.3.205

# 如果配置了别名
ssh aliyun
```

## 🆘 如果还是无法连接

### 检查安全组

1. 在阿里云控制台，找到你的服务器
2. 点击 **安全组**
3. 确保 **入方向规则** 中有：
   - 端口：22
   - 协议：TCP
   - 授权对象：0.0.0.0/0

### 检查服务器 SSH 配置

如果已经通过 VNC 或密码登录，检查 SSH 配置：

```bash
# 检查 SSH 配置
sudo vim /etc/ssh/sshd_config

# 确保以下配置：
# PubkeyAuthentication yes
# PasswordAuthentication yes  # 临时允许密码登录

# 重启 SSH 服务
sudo systemctl restart sshd
```

## 📝 快速命令总结

**在服务器上执行（通过密码或 VNC 登录后）：**

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOPx60JQAnR2iExiINvoJIsOEeJ77Q2KIYwdizJxt+kW fidoo@mac" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

**推荐方法**：使用方法一（重置密码），这是最简单直接的方式。

