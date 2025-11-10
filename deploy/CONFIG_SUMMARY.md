# 生产环境配置摘要

## 🔐 已生成的密钥和密码

### JWT Secret
```
WK3aX0sFWQCsE0nzRW9kAxbU7gTd1sw0RpnHJFRdmDo=
```

### 数据库密码
```
C6smYzpjKKUVlr1xHrECiJbaqMitM0QV
```

### Redis 密码
```
y05lFupXH5jquE5s3ZXCnQi7PEun0W9x
```

## 📝 配置文件位置

1. **后端服务配置**: `service/.env.production`
2. **Docker Compose 配置**: `deploy/docker-compose.prod.yml`

## ⚠️ 重要提醒

1. **不要将 `.env.production` 提交到 Git 仓库**
2. **在生产环境部署前，请修改以下配置：**
   - `APP_URL` - 改为你的实际域名
   - `NEXT_PUBLIC_API_URL` - 改为你的 API 地址
   - `CORS_ORIGIN` - 添加你的前端域名

3. **安全建议：**
   - 定期更换密码和密钥
   - 使用环境变量管理敏感信息
   - 配置防火墙规则
   - 启用 HTTPS

## 🚀 部署步骤

1. 将 `service/.env.production` 复制到服务器
2. 修改域名相关配置
3. 运行部署脚本：
   ```bash
   ./scripts/deploy.sh docker production
   ```

## 📋 配置检查清单

- [ ] 修改 `APP_URL` 为实际域名
- [ ] 修改 `NEXT_PUBLIC_API_URL` 为实际 API 地址
- [ ] 配置 `CORS_ORIGIN` 允许的前端域名
- [ ] 确认数据库密码已更新
- [ ] 确认 Redis 密码已更新
- [ ] 确认 JWT Secret 已更新
- [ ] 配置 OAuth（如需要）
- [ ] 配置 Nginx 反向代理
- [ ] 配置 SSL 证书

