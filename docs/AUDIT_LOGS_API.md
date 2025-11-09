# 审计日志 API 文档

## 概述

审计日志 API 提供了查询和管理审计日志的功能，帮助管理员监控系统安全、追踪用户操作和检测异常行为。

## 权限要求

- **管理员（ADMIN）**：可以访问所有审计日志功能
- **编辑（EDITOR）**：可以查看自己的操作历史
- **普通用户（USER）**：可以查看自己的操作历史

## API 端点

### 1. 查询审计日志

**GET** `/api/v1/audit-logs`

查询审计日志，支持多种过滤条件。

**权限**: ADMIN

**查询参数**:
- `userId` (string, 可选): 用户 ID
- `username` (string, 可选): 用户名（模糊匹配）
- `action` (AuditAction, 可选): 操作类型
- `resource` (string, 可选): 资源类型
- `resourceId` (string, 可选): 资源 ID
- `ip` (string, 可选): IP 地址
- `status` (AuditStatus, 可选): 状态（success/error/warning）
- `severity` (AuditSeverity, 可选): 严重程度（low/medium/high/critical）
- `isAnomaly` (boolean, 可选): 是否异常
- `startTime` (Date, 可选): 开始时间
- `endTime` (Date, 可选): 结束时间
- `limit` (number, 可选): 每页数量（默认无限制）
- `offset` (number, 可选): 偏移量（默认0）

**响应示例**:
```json
{
  "logs": [
    {
      "id": "uuid",
      "userId": "user-id",
      "username": "john",
      "action": "LOGIN",
      "resource": "Auth",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "status": "success",
      "severity": "medium",
      "isAnomaly": true,
      "anomalyReason": "新设备登录; 新 IP 地址登录",
      "timestamp": "2024-01-02T10:00:00Z"
    }
  ],
  "total": 100
}
```

### 2. 查询异常日志

**GET** `/api/v1/audit-logs/anomalies`

查询异常操作日志。

**权限**: ADMIN

**查询参数**:
- `userId` (string, 可选): 用户 ID
- `startTime` (Date, 可选): 开始时间
- `endTime` (Date, 可选): 结束时间
- `limit` (number, 可选): 每页数量

**响应**: 返回异常日志列表

### 3. 查询用户操作历史

**GET** `/api/v1/audit-logs/user/:userId`

查询指定用户的操作历史。

**权限**: ADMIN, EDITOR（只能查看自己的）

**路径参数**:
- `userId` (string): 用户 ID

**查询参数**:
- `limit` (number, 可选): 数量限制（默认100）

**响应**: 返回用户操作历史列表

### 4. 查询 IP 操作历史

**GET** `/api/v1/audit-logs/ip/:ip`

查询指定 IP 的操作历史。

**权限**: ADMIN

**路径参数**:
- `ip` (string): IP 地址

**查询参数**:
- `limit` (number, 可选): 数量限制（默认100）

**响应**: 返回 IP 操作历史列表

### 5. 根据追踪 ID 查询日志

**GET** `/api/v1/audit-logs/trace/:traceId`

根据追踪 ID 查询相关日志（用于追踪一次请求的完整流程）。

**权限**: ADMIN

**路径参数**:
- `traceId` (string): 追踪 ID

**响应**: 返回相关日志列表

### 6. 统计操作数量

**GET** `/api/v1/audit-logs/stats/action/:action`

统计指定操作的数量。

**权限**: ADMIN

**路径参数**:
- `action` (AuditAction): 操作类型

**查询参数**:
- `startTime` (Date, 可选): 开始时间
- `endTime` (Date, 可选): 结束时间

**响应示例**:
```json
{
  "action": "LOGIN",
  "count": 150
}
```

### 7. 统计异常操作数量

**GET** `/api/v1/audit-logs/stats/anomalies`

统计异常操作的数量。

**权限**: ADMIN

**查询参数**:
- `startTime` (Date, 可选): 开始时间
- `endTime` (Date, 可选): 结束时间

**响应示例**:
```json
{
  "count": 25
}
```

### 8. 清理过期日志

**POST** `/api/v1/audit-logs/clean`

清理过期的审计日志。

**权限**: ADMIN

**查询参数**:
- `daysToKeep` (number, 可选): 保留天数（默认90天）

**响应示例**:
```json
{
  "message": "已清理 1000 条过期日志",
  "deleted": 1000
}
```

### 9. 获取当前用户的操作历史

**GET** `/api/v1/audit-logs/my-logs`

获取当前登录用户的操作历史。

**权限**: 所有认证用户

**查询参数**:
- `limit` (number, 可选): 数量限制（默认100）

**响应**: 返回当前用户的操作历史列表

## 操作类型（AuditAction）

- `LOGIN`: 登录
- `LOGOUT`: 登出
- `REGISTER`: 注册
- `TOKEN_REFRESH`: 刷新令牌
- `FORCE_LOGOUT`: 强制登出
- `PASSWORD_CHANGE`: 修改密码
- `PASSWORD_RESET`: 重置密码
- `DEVICE_CREATE`: 创建设备
- `DEVICE_DEACTIVATE`: 停用设备
- `DEVICE_DELETE`: 删除设备
- `USER_CREATE`: 创建用户
- `USER_UPDATE`: 更新用户
- `USER_DELETE`: 删除用户
- `USER_BAN`: 封禁用户
- `USER_UNBAN`: 解封用户
- `PERMISSION_GRANT`: 授予权限
- `PERMISSION_REVOKE`: 撤销权限
- `ROLE_ASSIGN`: 分配角色
- `ROLE_REVOKE`: 撤销角色
- `POST_CREATE`: 创建文章
- `POST_UPDATE`: 更新文章
- `POST_DELETE`: 删除文章
- `POST_PUBLISH`: 发布文章
- `SETTINGS_UPDATE`: 更新设置
- `CONFIG_UPDATE`: 更新配置

## 状态（AuditStatus）

- `SUCCESS`: 成功
- `ERROR`: 错误
- `WARNING`: 警告

## 严重程度（AuditSeverity）

- `LOW`: 低
- `MEDIUM`: 中
- `HIGH`: 高
- `CRITICAL`: 严重

## 使用示例

### 查询最近的异常登录

```bash
GET /api/v1/audit-logs/anomalies?limit=10
```

### 查询特定用户的操作历史

```bash
GET /api/v1/audit-logs/user/user-id?limit=50
```

### 统计今天的登录次数

```bash
GET /api/v1/audit-logs/stats/action/LOGIN?startTime=2024-01-02T00:00:00Z&endTime=2024-01-02T23:59:59Z
```

### 清理90天前的日志

```bash
POST /api/v1/audit-logs/clean?daysToKeep=90
```

## 注意事项

1. **性能**: 大量日志查询可能影响性能，建议使用分页和限制
2. **权限**: 确保只有授权用户可以访问审计日志
3. **数据保留**: 定期清理过期日志以节省存储空间
4. **隐私**: 审计日志可能包含敏感信息，需要妥善保护

---

**创建日期**: 2024-01-02  
**状态**: ✅ 已完成

