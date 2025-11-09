# 安全性增强文档

## 概述

本文档描述了已实现的安全性增强功能，包括 Token 黑名单和设备管理。

## ✅ 已完成的功能

### 1. Token 黑名单服务

**文件**: `service/src/modules/auth/services/token-blacklist.service.ts`

**功能**:
- 将已撤销的 JWT token 存储在 Redis 中
- 检查 token 是否在黑名单中
- 支持强制登出用户（撤销所有 token）
- 自动根据 token 过期时间设置 Redis TTL

**核心方法**:
- `addToBlacklist(token: string)`: 将 token 加入黑名单
- `isBlacklisted(token: string)`: 检查 token 是否在黑名单中
- `blacklistUserTokens(userId: string)`: 强制登出用户
- `isUserBlacklisted(userId: string, tokenIssuedAt: number)`: 检查用户是否被强制登出

**实现细节**:
- 使用 token 的 SHA256 hash 作为 Redis key，避免 key 过长
- 根据 token 的过期时间自动设置 Redis TTL
- 如果 token 已过期，无需加入黑名单

### 2. 设备管理服务

**文件**: 
- `service/src/modules/auth/services/device.service.ts`
- `service/src/modules/auth/entities/user-device.entity.ts`

**功能**:
- 跟踪用户的登录设备
- 记录设备信息（设备名称、类型、IP、用户代理等）
- 管理设备状态（活跃、停用、信任）
- 支持设备删除和管理

**实体字段**:
- `userId`: 用户 ID
- `deviceId`: 设备唯一标识（基于 User-Agent 和 IP 的 hash）
- `deviceName`: 设备名称（如：Chrome on Windows）
- `deviceType`: 设备类型（desktop, mobile, tablet）
- `userAgent`: 用户代理字符串
- `ipAddress`: IP 地址
- `lastActiveAt`: 最后活跃时间
- `isActive`: 是否活跃
- `isTrusted`: 是否信任设备
- `loginCount`: 登录次数
- `lastLoginAt`: 最后登录时间

**核心方法**:
- `createOrUpdateDevice(userId, deviceInfo)`: 创建或更新设备记录
- `getUserDevices(userId)`: 获取用户的所有设备
- `getActiveDevices(userId)`: 获取用户的活跃设备
- `deactivateDevice(userId, deviceId)`: 停用设备
- `deleteDevice(userId, deviceId)`: 删除设备
- `generateDeviceId(userAgent, ipAddress)`: 生成设备 ID
- `parseDeviceInfo(userAgent)`: 解析设备信息

### 3. JWT 策略增强

**文件**: `service/src/modules/auth/strategies/jwt.strategy.ts`

**增强功能**:
- 在验证 token 时检查黑名单
- 检查用户是否被强制登出
- 验证用户状态（是否被禁用）
- 传递 request 对象以获取原始 token

**验证流程**:
1. 提取 token
2. 检查 token 是否在黑名单中
3. 检查用户是否被强制登出（通过 iat 时间戳比较）
4. 验证用户是否存在
5. 检查用户状态（active/inactive/banned）

### 4. 认证服务增强

**文件**: `service/src/modules/auth/auth.service.ts`

**新增功能**:
- 登录时自动创建设备记录
- 登出时将 token 加入黑名单
- 支持强制登出用户

**方法**:
- `login(loginDto)`: 登录时创建设备记录
- `logout(token, userId)`: 登出时将 token 加入黑名单
- `forceLogout(userId)`: 强制登出用户（撤销所有 token）

### 5. 认证控制器增强

**文件**: `service/src/modules/auth/auth.controller.ts`

**新增 API 端点**:
- `GET /auth/devices`: 获取当前用户的设备列表
- `POST /auth/devices/:deviceId/deactivate`: 停用设备
- `POST /auth/devices/:deviceId/delete`: 删除设备
- `POST /auth/force-logout`: 强制登出（撤销所有 token）

**增强的端点**:
- `POST /auth/login`: 自动检测设备信息并记录
- `POST /auth/logout`: 将 token 加入黑名单

## 🔒 安全特性

### Token 黑名单
- ✅ 登出时自动将 token 加入黑名单
- ✅ 验证 token 时检查黑名单
- ✅ 支持强制登出（撤销所有 token）
- ✅ 自动过期（根据 token 过期时间）

### 设备管理
- ✅ 自动跟踪登录设备
- ✅ 记录设备详细信息
- ✅ 支持设备停用和删除
- ✅ 支持设备信任状态

### 用户状态验证
- ✅ 检查用户是否被禁用
- ✅ 检查用户是否被强制登出
- ✅ 验证用户是否存在

## 📊 数据库变更

### 新增表：`user_devices`

需要运行数据库迁移来创建此表。表结构如下：

```sql
CREATE TABLE user_devices (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  device_id VARCHAR(100) NOT NULL,
  device_name VARCHAR(200),
  device_type VARCHAR(50),
  user_agent TEXT,
  ip_address VARCHAR(50),
  last_active_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  is_trusted BOOLEAN DEFAULT false,
  login_count INTEGER DEFAULT 0,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, device_id),
  INDEX idx_user_id (user_id),
  INDEX idx_device_id (device_id),
  INDEX idx_ip_address (ip_address),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🚀 使用示例

### 前端登出
```typescript
// 登出时，token 会自动加入黑名单
await authApi.logout();
```

### 获取设备列表
```typescript
const devices = await authApi.getDevices();
```

### 停用设备
```typescript
await authApi.deactivateDevice(deviceId);
```

### 强制登出
```typescript
// 撤销所有 token，强制所有设备登出
await authApi.forceLogout();
```

## 📝 注意事项

1. **Redis 依赖**: Token 黑名单功能依赖 Redis，确保 Redis 服务正常运行
2. **数据库迁移**: 需要创建 `user_devices` 表
3. **设备 ID 生成**: 设备 ID 基于 User-Agent 和 IP 的 hash，相同设备和 IP 会生成相同的设备 ID
4. **性能考虑**: Token 黑名单检查会增加一次 Redis 查询，但影响很小
5. **过期清理**: Token 黑名单会自动过期，无需手动清理

## 🔄 后续优化建议

1. **设备指纹增强**: 使用更复杂的设备指纹算法（Canvas、WebGL 等）
2. **异常检测**: 检测异常登录行为（新设备、新 IP、异常时间等）
3. **通知功能**: 新设备登录时发送通知
4. **审计日志**: 记录所有安全相关操作
5. **限流增强**: 针对设备级别的限流

### 4. 审计日志 API

**文件**: `service/src/modules/audit-logs/audit-logs.controller.ts`

**功能**:
- 提供完整的审计日志查询和管理 API
- 支持多种过滤条件（用户、操作类型、时间范围等）
- 支持异常日志查询
- 支持统计功能
- 支持日志清理

**API 端点**:
- `GET /audit-logs`: 查询审计日志（支持多种过滤条件）
- `GET /audit-logs/anomalies`: 查询异常日志
- `GET /audit-logs/user/:userId`: 查询用户操作历史
- `GET /audit-logs/ip/:ip`: 查询 IP 操作历史
- `GET /audit-logs/trace/:traceId`: 根据追踪 ID 查询日志
- `GET /audit-logs/stats/action/:action`: 统计操作数量
- `GET /audit-logs/stats/anomalies`: 统计异常操作数量
- `POST /audit-logs/clean`: 清理过期日志
- `GET /audit-logs/my-logs`: 获取当前用户的操作历史

**权限**:
- 管理员（ADMIN）：可以访问所有功能
- 编辑（EDITOR）：可以查看自己的操作历史
- 普通用户：可以查看自己的操作历史

详细 API 文档请参考 `docs/AUDIT_LOGS_API.md`。

---

**完成日期**: 2024-01-02  
**状态**: ✅ 已完成（包括 Token 黑名单、设备管理、审计日志、异常检测和 API）

