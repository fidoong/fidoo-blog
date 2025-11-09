# 新增功能数据库种子脚本说明

## 概述

本文档说明新增功能（审计日志、设备管理、异常通知等）的数据库初始化脚本使用方法。

## 新增功能列表

### 1. 审计日志系统 ✅

**功能说明**:
- 记录所有用户操作和安全事件
- 支持异常检测
- 提供详细的查询和统计功能

**数据库表**: `audit_logs`

**菜单**: 系统管理 > 审计日志 (`/system/audit-logs`)

**权限**:
- `audit-logs:view` - 查看审计日志
- `audit-logs:query` - 查询审计日志
- `audit-logs:anomalies:view` - 查看异常日志
- `audit-logs:user:view` - 查看用户操作历史
- `audit-logs:ip:view` - 查看 IP 操作历史
- `audit-logs:trace:view` - 追踪 ID 查询
- `audit-logs:stats:view` - 操作统计查看
- `audit-logs:clean` - 清理过期日志

### 2. 设备管理 ✅

**功能说明**:
- 记录用户登录设备信息
- 支持设备查询、停用、删除
- 自动检测新设备

**数据库表**: `user_devices`

**API 端点**:
- `GET /auth/devices` - 获取设备列表
- `POST /auth/devices/:deviceId/deactivate` - 停用设备
- `POST /auth/devices/:deviceId/delete` - 删除设备

**说明**: 设备管理功能已集成到认证模块，无需单独的菜单项。设备数据由登录流程自动创建。

### 3. Token 黑名单 ✅

**功能说明**:
- 使用 Redis 存储已撤销的 Token
- 支持强制登出功能
- 防止 Token 被重复使用

**存储**: Redis

**API 端点**:
- `POST /auth/force-logout` - 强制登出（撤销所有 token）

### 4. 异常通知 ✅

**功能说明**:
- 检测到异常时自动发送系统内通知
- 通知用户本人（严重异常时）
- 通知所有管理员

**数据库表**: `notifications`

**说明**: 异常通知功能已集成到审计日志模块，无需单独初始化。

## 脚本使用

### 方式一：全新初始化（推荐）

如果系统是全新安装，直接运行权限系统初始化脚本，它会包含所有新功能：

```bash
cd service
pnpm run seed:permission
```

这个脚本会创建：
- ✅ 所有权限（包括审计日志权限）
- ✅ 所有菜单（包括审计日志菜单）
- ✅ 系统角色
- ✅ 角色权限和菜单关联

### 方式二：已有系统添加审计日志

如果系统已经初始化了权限系统，但缺少审计日志功能：

```bash
cd service
pnpm run seed:audit-logs
```

这个脚本会：
- ✅ 检查并创建审计日志权限（如果不存在）
- ✅ 在系统管理菜单下添加审计日志子菜单
- ✅ 为管理员角色分配审计日志权限和菜单

## 数据库表初始化

### 审计日志表

审计日志表通过数据库迁移自动创建，无需手动初始化数据。

**迁移文件**: `service/src/database/migrations/`（如果存在）

**表结构**: 参考 `service/src/modules/audit-logs/entities/audit-log.entity.ts`

### 设备表

设备表通过数据库迁移自动创建，设备数据由登录流程自动生成。

**表结构**: 参考 `service/src/modules/auth/entities/user-device.entity.ts`

### 通知表

通知表应该已经存在（如果系统已有通知功能），异常通知会使用现有的通知表。

**表结构**: 参考 `service/src/modules/notifications/entities/notification.entity.ts`

## 验证安装

### 1. 检查菜单

登录 admin 后台，检查系统管理菜单下是否有"审计日志"菜单项。

### 2. 检查权限

在权限管理页面，搜索 `audit-logs`，应该能看到 8 个审计日志相关权限。

### 3. 检查 API

访问 `GET /api/v1/audit-logs`（需要管理员权限），应该能正常返回数据。

## 常见问题

### Q: 运行 `seed:permission` 会清空现有数据吗？

A: 是的，这个脚本会清空并重新创建所有权限、菜单和角色数据。如果系统已有数据，建议：
1. 先备份数据库
2. 或者使用 `seed:audit-logs` 单独添加审计日志功能

### Q: 设备管理需要单独初始化吗？

A: 不需要。设备数据由登录流程自动创建，首次登录时会自动记录设备信息。

### Q: 审计日志数据需要手动初始化吗？

A: 不需要。审计日志数据由系统自动生成，当用户执行操作时会自动记录。

### Q: 如何清理旧的审计日志？

A: 可以通过 API `POST /api/v1/audit-logs/clean?daysToKeep=90` 清理 90 天前的日志，或者在 admin 后台的审计日志页面点击"清理过期日志"按钮。

## 相关文档

- [数据库种子脚本使用指南](./DATABASE_SEEDS.md)
- [审计日志 API 文档](./AUDIT_LOGS_API.md)
- [安全增强文档](./SECURITY_ENHANCEMENTS.md)
- [异常通知文档](./ANOMALY_NOTIFICATION.md)

---

**创建日期**: 2024-01-02  
**状态**: ✅ 已完成

