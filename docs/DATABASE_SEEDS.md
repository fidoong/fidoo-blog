# 数据库种子脚本使用指南

## 概述

本文档介绍如何使用数据库种子脚本来初始化系统数据，包括权限系统、菜单、字典和审计日志等。

## 脚本列表

### 1. 权限系统初始化

**脚本**: `service/src/database/seeds/init-permission-system.ts`

**功能**: 初始化完整的权限系统，包括：
- 权限列表（所有模块的权限）
- 菜单树（仪表盘、内容管理、用户管理、媒体管理、系统管理）
- 系统角色（管理员、编辑、普通用户）
- 角色权限关联
- 角色菜单关联
- 用户角色分配

**运行方式**:
```bash
cd service
pnpm run seed:permission
```

**包含的菜单**:
- 仪表盘
- 内容管理（文章、分类、标签、评论）
- 用户管理
- 媒体管理
- 系统管理（菜单、权限、角色、系统信息、字典管理、**审计日志**）

**包含的权限**:
- 所有模块的 CRUD 权限
- 审计日志相关权限（查看、查询、异常日志、统计、清理等）

### 2. 审计日志菜单添加

**脚本**: `service/src/database/seeds/add-audit-logs-menu.ts`

**功能**: 为现有系统添加审计日志菜单和权限（如果权限系统已初始化但缺少审计日志）

**运行方式**:
```bash
cd service
pnpm run seed:audit-logs
```

**功能说明**:
- 检查并创建审计日志相关权限（如果不存在）
- 在系统管理菜单下添加审计日志子菜单
- 为管理员角色分配审计日志权限和菜单

**适用场景**:
- 权限系统已初始化，但缺少审计日志菜单
- 需要单独添加审计日志功能

### 3. 字典初始化

**脚本**: `service/src/database/seeds/init-dictionaries.ts`

**功能**: 初始化系统数据字典

**运行方式**:
```bash
cd service
pnpm run seed:dictionaries
```

### 4. 基础数据种子

**脚本**: `service/src/database/seeds/run-seed.ts`

**功能**: 初始化基础业务数据（用户、分类、标签、文章、评论等）

**运行方式**:
```bash
cd service
pnpm run seed
```

**⚠️ 警告**: 此脚本会清空现有数据！

### 5. 修复管理员角色

**脚本**: `service/src/database/seeds/fix-admin-role.ts`

**功能**: 修复管理员角色的权限分配

**运行方式**:
```bash
cd service
pnpm run seed:fix-admin
```

## 新增功能说明

### 审计日志功能

**菜单路径**: `/system/audit-logs`

**权限列表**:
- `audit-logs:view` - 审计日志查看
- `audit-logs:query` - 审计日志查询
- `audit-logs:anomalies:view` - 异常日志查看
- `audit-logs:user:view` - 用户操作历史查看
- `audit-logs:ip:view` - IP 操作历史查看
- `audit-logs:trace:view` - 追踪 ID 查询
- `audit-logs:stats:view` - 操作统计查看
- `audit-logs:clean` - 清理过期日志

**菜单信息**:
- 名称: `audit-logs`
- 标题: `审计日志`
- 路径: `/system/audit-logs`
- 图标: `FileSearch`
- 权限码: `audit-logs:view`

### 设备管理功能

设备管理功能已集成到认证模块中，无需单独的菜单项。相关功能包括：
- 设备记录创建和更新（登录时自动）
- 设备查询（`GET /auth/devices`）
- 设备停用（`POST /auth/devices/:deviceId/deactivate`）
- 设备删除（`POST /auth/devices/:deviceId/delete`）

### 异常通知功能

异常通知功能已集成到审计日志模块中，当检测到异常时会自动发送系统内通知。

## 使用流程

### 全新安装

1. **初始化权限系统**:
   ```bash
   cd service
   pnpm run seed:permission
   ```
   这会创建所有权限、菜单和角色，包括审计日志功能。

2. **初始化字典**（可选）:
   ```bash
   pnpm run seed:dictionaries
   ```

3. **初始化基础数据**（可选，会清空现有数据）:
   ```bash
   pnpm run seed
   ```

### 已有系统添加审计日志

如果系统已经初始化了权限系统，但缺少审计日志功能：

```bash
cd service
pnpm run seed:audit-logs
```

## 注意事项

1. **数据备份**: 运行种子脚本前，建议备份数据库
2. **权限系统**: `init-permission-system.ts` 会清空并重新创建所有权限、菜单和角色数据
3. **审计日志**: 审计日志数据由系统自动生成，无需手动初始化
4. **设备管理**: 设备数据由登录流程自动创建，无需手动初始化

## 脚本执行顺序

推荐的执行顺序：

1. `seed:permission` - 初始化权限系统（必须）
2. `seed:dictionaries` - 初始化字典（可选）
3. `seed` - 初始化基础业务数据（可选）
4. `seed:audit-logs` - 如果权限系统已存在但缺少审计日志（可选）

## 相关文档

- [权限系统文档](../service/PERMISSION_SYSTEM.md)
- [审计日志 API 文档](./AUDIT_LOGS_API.md)
- [安全增强文档](./SECURITY_ENHANCEMENTS.md)

---

**创建日期**: 2024-01-02  
**状态**: ✅ 已完成

