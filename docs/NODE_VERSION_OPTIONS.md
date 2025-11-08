# Node.js 版本选择

## 📋 可用的 Node.js 版本

### Node.js 20（推荐，LTS）
- 最新长期支持版本
- 性能更好
- 兼容性良好

### Node.js 18（当前使用）
- 也是 LTS 版本
- 稳定可靠

### Node.js 16（旧版本）
- 即将结束支持
- 不推荐使用

## 🔧 修改 Node 版本

### 方法一：使用 Node 20（推荐）

已在本地更新为 Node 20，在服务器上：

```bash
cd ~/fidoo-blog
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
```

### 方法二：手动修改为 Node 20

```bash
cd ~/fidoo-blog

# 修改所有 Dockerfile
sed -i 's|node:18-alpine|node:20-alpine|g' service/Dockerfile
sed -i 's|node:18-alpine|node:20-alpine|g' web/Dockerfile
sed -i 's|node:18-alpine|node:20-alpine|g' admin/Dockerfile

# 重新构建
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
```

### 方法三：使用其他版本

如果想使用其他版本（如 Node 16）：

```bash
# 修改为 Node 16
sed -i 's|node:20-alpine|node:16-alpine|g' service/Dockerfile
sed -i 's|node:20-alpine|node:16-alpine|g' web/Dockerfile
sed -i 's|node:20-alpine|node:16-alpine|g' admin/Dockerfile
```

## ✅ 已更新为 Node 20

所有 Dockerfile 已更新为使用 Node 20：
- `service/Dockerfile` - Node 20
- `web/Dockerfile` - Node 20
- `admin/Dockerfile` - Node 20

## 📝 注意事项

- Node 20 是 LTS 版本，兼容性良好
- 如果项目有特殊要求，可以改回 Node 18
- 确保 package.json 中的 engines 配置兼容

---

**推荐**：使用 Node 20，性能更好且是当前推荐的 LTS 版本。

