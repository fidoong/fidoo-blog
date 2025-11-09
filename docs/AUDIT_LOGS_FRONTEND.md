# 审计日志前端界面实现文档

## 概述

本文档描述了审计日志前端界面的实现，包括 API 客户端、页面组件和功能特性。

## 实现内容

### 1. API 客户端

**文件**: `admin/src/lib/api/audit-logs.ts`

实现了完整的审计日志 API 客户端，包括：

- **枚举类型**:
  - `AuditAction`: 操作类型（login, logout, user_create 等）
  - `AuditStatus`: 状态（success, error, warning）
  - `AuditSeverity`: 严重程度（low, medium, high, critical）

- **接口类型**:
  - `AuditLog`: 审计日志实体
  - `QueryAuditLogsDto`: 查询参数
  - `AuditLogsResponse`: 查询响应
  - `ActionStatsResponse`: 操作统计响应
  - `AnomaliesStatsResponse`: 异常统计响应
  - `CleanLogsResponse`: 清理日志响应

- **API 方法**:
  - `getAuditLogs`: 查询审计日志（支持多种过滤条件）
  - `getAnomalies`: 查询异常日志
  - `getUserLogs`: 查询用户操作历史
  - `getIpLogs`: 查询 IP 操作历史
  - `getLogsByTraceId`: 根据追踪 ID 查询日志
  - `getActionStats`: 统计操作数量
  - `getAnomaliesStats`: 统计异常操作数量
  - `cleanOldLogs`: 清理过期日志
  - `getMyLogs`: 获取当前用户的操作历史

### 2. 页面组件

**文件**: 
- `admin/src/app/(admin)/system/audit-logs/page.tsx` - 页面入口（使用 dynamic 代码分割）
- `admin/src/app/(admin)/system/audit-logs/AuditLogsPageContent.tsx` - 页面内容组件

#### 功能特性

1. **搜索功能**:
   - 用户名搜索（模糊匹配）
   - 操作类型筛选
   - 资源类型筛选
   - IP 地址筛选
   - 状态筛选（成功/错误/警告）
   - 严重程度筛选（低/中/高/严重）
   - 异常标识筛选
   - 时间范围选择（支持日期和时间）

2. **表格展示**:
   - 时间（格式化显示）
   - 用户
   - 操作类型（带颜色标签）
   - 资源
   - IP 地址
   - 状态（带颜色标签：成功/错误/警告）
   - 严重程度（带颜色标签：低/中/高/严重）
   - 异常标识（异常/正常）
   - 异常原因（可展开查看）

3. **工具栏操作**:
   - 刷新数据
   - 清理过期日志（90天前，需要确认）

4. **性能优化**:
   - 使用 `useTable` hook 进行数据管理
   - 使用 `useDebounce` 进行搜索防抖
   - 使用 `TableSkeleton` 显示加载状态
   - 使用 `dynamic` 实现代码分割和懒加载

### 3. 代码分割

审计日志页面已实现路由级别代码分割：

```typescript
// admin/src/app/(admin)/system/audit-logs/page.tsx
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const AuditLogsPageContent = dynamic(() => import('./AuditLogsPageContent'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

export default function AuditLogsPage() {
  return <AuditLogsPageContent />;
}
```

## 使用方式

### 访问页面

审计日志页面位于：`/system/audit-logs`

### 权限要求

- **管理员（ADMIN）**: 可以访问所有审计日志功能
- **编辑（EDITOR）**: 可以查看自己的操作历史
- **普通用户（USER）**: 可以查看自己的操作历史

### 功能说明

1. **查询审计日志**:
   - 使用搜索表单设置过滤条件
   - 选择时间范围
   - 点击"搜索"或等待防抖自动触发

2. **查看详情**:
   - 点击表格行可查看详细信息（如果实现了详情弹窗）
   - 异常日志会显示异常原因

3. **清理日志**:
   - 点击"清理过期日志"按钮
   - 确认后清理90天前的日志
   - 清理后自动刷新数据

## 技术实现

### 数据管理

使用 `useTable` hook 进行数据管理：

```typescript
const table = useTable<AuditLog, QueryAuditLogsDto & Record<string, unknown>>({
  queryKey: ['audit-logs'],
  queryFn: async (params) => {
    const result = await auditLogsApi.getAuditLogs(params);
    return {
      items: result.logs,
      total: result.total,
    };
  },
  initialParams: {},
  initialPagination: {
    pageSize: 20,
  },
});
```

### 搜索防抖

使用 `useDebounce` hook 实现搜索防抖：

```typescript
const debouncedSearchValues = useDebounce(searchValues, 500);

React.useEffect(() => {
  // 当防抖后的搜索值变化时，更新查询参数
  table.setParams(debouncedSearchValues);
}, [debouncedSearchValues]);
```

### 时间范围选择

使用 Ant Design 的 `RangePicker` 组件：

```typescript
<RangePicker
  value={dateRange}
  onChange={(dates) => setDateRange(dates)}
  showTime
  format="YYYY-MM-DD HH:mm:ss"
/>
```

## 后续优化建议

1. **详情弹窗**: 实现点击行查看详细信息的弹窗
2. **导出功能**: 添加导出审计日志为 Excel/CSV 的功能
3. **统计图表**: 添加操作统计图表（按时间、按操作类型等）
4. **实时更新**: 使用 WebSocket 实现实时日志更新
5. **高级筛选**: 添加更多筛选条件（如设备 ID、追踪 ID 等）
6. **批量操作**: 支持批量导出、批量标记等操作

## 相关文件

- `admin/src/lib/api/audit-logs.ts` - API 客户端
- `admin/src/app/(admin)/system/audit-logs/page.tsx` - 页面入口
- `admin/src/app/(admin)/system/audit-logs/AuditLogsPageContent.tsx` - 页面内容
- `docs/AUDIT_LOGS_API.md` - 后端 API 文档

---

**创建日期**: 2024-01-02  
**状态**: ✅ 已完成

