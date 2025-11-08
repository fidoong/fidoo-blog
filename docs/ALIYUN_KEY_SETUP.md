# 阿里云密钥对配置指南

## ⚠️ 重要说明

- **只需要上传公钥**（.pub 文件）
- **永远不要上传私钥**（没有 .pub 后缀的文件）
- 私钥保存在本地，用于身份验证

## 🔑 你的公钥内容（复制这个）

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOPx60JQAnR2iExiINvoJIsOEeJ77Q2KIYwdizJxt+kW fidoo@mac
```

## 📋 阿里云控制台操作步骤

### 方法一：导入密钥对

1. 登录阿里云控制台
2. 进入 **云服务器 ECS** → **网络与安全** → **密钥对**
3. 点击 **创建密钥对** 或 **导入密钥对**
4. 选择 **导入已有密钥对**
5. **密钥对名称**：填写一个名称，如 `fidoo-mac-key`
6. **公钥内容**：粘贴上面的公钥内容（整行）
7. 点击 **确定**

### 方法二：如果界面要求上传文件

如果界面要求上传文件：

1. 在本地创建公钥文件：
   ```bash
   # 在项目目录下已经有 ssh-key.txt 文件
   cat ssh-key.txt
   ```

2. 或者创建新文件：
   ```bash
   # 创建公钥文件
   cat ~/.ssh/id_ed25519.pub > public-key.txt
   ```

3. 上传这个文件到阿里云

## 🔍 如何区分公钥和私钥

### 公钥（可以上传）
- 文件名通常以 `.pub` 结尾
- 内容以 `ssh-ed25519` 或 `ssh-rsa` 开头
- 可以安全地分享和上传

### 私钥（不要上传！）
- 文件名没有 `.pub` 后缀
- 内容以 `-----BEGIN OPENSSH PRIVATE KEY-----` 开头
- 必须保密，永远不要上传或分享

## ✅ 验证步骤

### 1. 在阿里云控制台绑定密钥对

1. 进入 **ECS 实例** → 选择你的服务器
2. 点击 **更多** → **网络和安全组** → **绑定密钥对**
3. 选择刚才导入的密钥对
4. 点击 **确定**

### 2. 使用密钥连接

```bash
# 使用密钥连接（无需密码）
ssh root@120.55.3.205
```

## 🆘 如果还是不行

### 方法：重置密码后手动添加（最可靠）

1. **重置实例密码**（在阿里云控制台）
2. **重启服务器**
3. **使用密码登录**：
   ```bash
   ssh root@120.55.3.205
   ```
4. **在服务器上执行**：
   ```bash
   mkdir -p ~/.ssh
   chmod 700 ~/.ssh
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOPx60JQAnR2iExiINvoJIsOEeJ77Q2KIYwdizJxt+kW fidoo@mac" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   exit
   ```
5. **使用密钥连接**：
   ```bash
   ssh root@120.55.3.205
   ```

## 📝 快速参考

**公钥内容（上传这个）：**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOPx60JQAnR2iExiINvoJIsOEeJ77Q2KIYwdizJxt+kW fidoo@mac
```

**公钥文件位置：**
- `~/.ssh/id_ed25519.pub`
- 项目目录下的 `ssh-key.txt`

**私钥位置（不要上传！）：**
- `~/.ssh/id_ed25519`

---

**记住**：只上传公钥（.pub），永远不要上传私钥！

