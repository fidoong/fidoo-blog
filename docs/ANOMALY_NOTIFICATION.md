# 异常通知功能实现文档

## 概述

本文档描述了异常通知功能的实现，当系统检测到异常登录、异常操作或异常 IP 活动时，会自动发送通知给相关用户和管理员。

## 实现内容

### 1. 异常通知服务

**文件**: `service/src/modules/audit-logs/services/anomaly-notification.service.ts`

实现了 `AnomalyNotificationService`，提供以下功能：

- **发送异常通知**: 当检测到异常时，发送通知给用户本人和管理员
- **登录异常通知**: 专门处理登录异常的通知
- **操作异常通知**: 处理操作异常的通知
- **IP 异常通知**: 处理 IP 异常活动的通知

#### 主要方法

1. **`sendAnomalyNotification`**: 发送通用异常通知
   - 根据严重程度决定是否通知用户本人（CRITICAL 或 HIGH 级别）
   - 向所有管理员发送通知

2. **`sendLoginAnomalyNotification`**: 发送登录异常通知
   - 包含用户信息、IP、User Agent、异常原因等

3. **`sendOperationAnomalyNotification`**: 发送操作异常通知
   - 包含操作类型、异常原因等

4. **`sendIpAnomalyNotification`**: 发送 IP 异常通知
   - 包含 IP 地址、异常原因、受影响用户等

### 2. 集成到认证服务

**文件**: `service/src/modules/auth/auth.service.ts`

在登录流程中集成异常通知：

```typescript
// 如果是异常登录，发送通知
if (anomalyResult.isAnomaly) {
  await this.anomalyNotificationService.sendLoginAnomalyNotification(
    user.id,
    user.username,
    anomalyResult,
    loginDto.ip,
    loginDto.userAgent,
    {
      deviceInfo: loginDto.deviceInfo,
      anomalyScore: anomalyResult.score,
    },
  );
}
```

### 3. 用户服务扩展

**文件**: `service/src/modules/users/users.service.ts`

添加了 `findByRole` 方法，用于查找特定角色的用户（如管理员）：

```typescript
async findByRole(role: string): Promise<User[]> {
  return this.usersRepository.find({
    where: { role: role as any },
  });
}
```

### 4. 模块配置

**文件**: `service/src/modules/audit-logs/audit-logs.module.ts`

- 导入 `NotificationsModule` 和 `UsersModule`
- 注册 `AnomalyNotificationService` 为提供者
- 导出 `AnomalyNotificationService` 供其他模块使用

## 通知内容

### 用户通知（严重异常时）

- **标题**: `安全提醒：检测到[严重程度]异常操作`
- **内容**: 
  - 异常操作类型
  - 异常原因
  - IP 地址（如果有）
  - 安全建议

### 管理员通知

- **标题**: `[[严重程度]] 检测到用户异常操作`
- **内容**:
  - 用户信息（用户名、ID）
  - 操作类型
  - 异常原因
  - IP 地址
  - User Agent
  - 详细信息（JSON 格式）

## 通知触发条件

### 登录异常

当检测到以下情况时触发：
- 新设备登录
- 新 IP 地址登录
- 短时间内多次登录失败（15 分钟内 3 次以上）
- 异常时间登录（凌晨 2-6 点）
- 异常的用户代理

### 操作异常

当检测到以下情况时触发：
- 操作频率异常（超过阈值）
- 敏感操作（删除、权限变更等）
- 批量操作

### IP 异常

当检测到以下情况时触发：
- IP 在 1 小时内 10 次以上登录失败
- IP 在 24 小时内有 5 次以上异常操作

## 通知级别

根据异常严重程度，通知分为：

- **LOW**: 低
- **MEDIUM**: 中
- **HIGH**: 高（会通知用户本人）
- **CRITICAL**: 严重（会通知用户本人）

## 使用示例

### 在登录流程中使用

```typescript
// 检测异常
const anomalyResult = await this.anomalyDetectionService.detectLoginAnomaly(
  user.id,
  ip,
  userAgent,
  deviceId,
  isNewDevice,
);

// 发送通知
if (anomalyResult.isAnomaly) {
  await this.anomalyNotificationService.sendLoginAnomalyNotification(
    user.id,
    user.username,
    anomalyResult,
    ip,
    userAgent,
    metadata,
  );
}
```

### 在操作流程中使用

```typescript
// 检测操作异常
const anomalyResult = await this.anomalyDetectionService.detectOperationAnomaly(
  userId,
  action,
  ip,
  resource,
);

// 发送通知
if (anomalyResult.isAnomaly) {
  await this.anomalyNotificationService.sendOperationAnomalyNotification(
    userId,
    username,
    action,
    anomalyResult,
    ip,
    userAgent,
    metadata,
  );
}
```

## 后续优化建议

1. **邮件通知**: 集成邮件服务，发送邮件通知给用户和管理员
2. **短信通知**: 集成短信服务，发送短信通知（紧急情况）
3. **Webhook 通知**: 支持 Webhook，集成第三方安全系统
4. **通知频率限制**: 避免短时间内重复发送相同类型的通知
5. **通知模板**: 使用模板引擎，支持自定义通知内容格式
6. **通知渠道配置**: 允许用户配置接收通知的渠道（系统内通知、邮件、短信等）

## 相关文件

- `service/src/modules/audit-logs/services/anomaly-notification.service.ts` - 异常通知服务
- `service/src/modules/audit-logs/services/anomaly-detection.service.ts` - 异常检测服务
- `service/src/modules/auth/auth.service.ts` - 认证服务（集成通知）
- `service/src/modules/notifications/notifications.service.ts` - 通知服务
- `service/src/modules/users/users.service.ts` - 用户服务（扩展方法）

---

**创建日期**: 2024-01-02  
**状态**: ✅ 已完成

