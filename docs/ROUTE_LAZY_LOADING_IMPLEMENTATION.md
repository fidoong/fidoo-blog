# 路由级别代码分割实现指南

## 概述

本文档提供了在 Next.js 14 App Router 中实现路由级别代码分割的详细步骤和最佳实践。

## 实现方式

### 方式：提取页面内容到单独组件（推荐）

将页面组件提取到单独文件，然后在 `page.tsx` 中使用 `dynamic` 导入。

## 实现步骤

### 1. 创建页面内容组件

在页面目录下创建 `[PageName]PageContent.tsx` 文件，将原来的页面实现移到这里。

**示例：`admin/src/app/(admin)/users/UsersPageContent.tsx`**

```typescript
'use client';

import React from 'react';
// ... 所有原来的导入和实现

export default function UsersPageContent() {
  // ... 所有原来的页面逻辑
  return (
    // ... 原来的 JSX
  );
}
```

### 2. 更新 page.tsx

将 `page.tsx` 改为使用 `dynamic` 导入：

**示例：`admin/src/app/(admin)/users/page.tsx`**

```typescript
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const UsersPageContent = dynamic(() => import('./UsersPageContent'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false, // 管理后台页面通常不需要 SSR
});

export default function UsersPage() {
  return <UsersPageContent />;
}
```

### 3. 配置选项说明

- **`loading`**: 加载时显示的组件，建议使用 Skeleton
- **`ssr: false`**: 禁用服务端渲染，适合管理后台页面
- **`ssr: true`** 或不设置：启用服务端渲染，适合需要 SEO 的页面

## 已实现的页面

- ✅ **Users** (`admin/src/app/(admin)/users/`)
  - 创建了 `UsersPageContent.tsx`
  - 更新了 `page.tsx` 使用 dynamic 导入

## 待实现的页面

按照相同的模式，可以为以下页面实现代码分割：

1. **Posts** (`admin/src/app/(admin)/posts/`)
   - 创建 `PostsPageContent.tsx`
   - 更新 `page.tsx`

2. **Categories** (`admin/src/app/(admin)/categories/`)
   - 创建 `CategoriesPageContent.tsx`
   - 更新 `page.tsx`

3. **Tags** (`admin/src/app/(admin)/tags/`)
   - 创建 `TagsPageContent.tsx`
   - 更新 `page.tsx`

4. **Comments** (`admin/src/app/(admin)/comments/`)
   - 创建 `CommentsPageContent.tsx`
   - 更新 `page.tsx`

5. **Media** (`admin/src/app/(admin)/media/`)
   - 创建 `MediaPageContent.tsx`
   - 更新 `page.tsx`

6. **System Pages** (`admin/src/app/(admin)/system/`)
   - Roles: `RolesPageContent.tsx`
   - Menus: `MenusPageContent.tsx`
   - Permissions: `PermissionsPageContent.tsx`
   - Dictionaries: `DictionariesPageContent.tsx`

## 批量实现脚本（参考）

可以使用以下步骤批量实现：

1. 为每个页面创建 `[PageName]PageContent.tsx`
2. 将原 `page.tsx` 的内容移到 `[PageName]PageContent.tsx`
3. 更新 `page.tsx` 使用 dynamic 导入

## 性能收益

### 预期收益

- **初始包大小减少**: 每个页面减少约 50-100KB
- **首屏加载时间**: 减少 200-500ms
- **用户体验**: 更快的页面切换，按需加载

### 验证方法

1. **构建分析**:
   ```bash
   npm run build
   # 查看构建输出，确认代码被分割
   ```

2. **浏览器检查**:
   - 打开浏览器 DevTools > Network
   - 刷新页面，查看初始加载的 JS 文件
   - 导航到其他页面，查看是否按需加载新的 chunk

3. **Bundle 分析**:
   ```bash
   npm run analyze  # 如果配置了 bundle analyzer
   ```

## 注意事项

1. **SSR 考虑**: 管理后台页面通常不需要 SSR，可以设置 `ssr: false`
2. **Loading 状态**: 提供合适的 loading 组件，提升用户体验
3. **预加载**: Next.js 会自动预加载可见路由，无需手动处理
4. **代码重复**: 确保提取的组件包含所有必要的导入和逻辑
5. **类型检查**: 确保 TypeScript 类型正确

## 最佳实践

1. **统一命名**: 使用 `[PageName]PageContent.tsx` 命名规范
2. **Loading 组件**: 使用与页面内容相似的 Skeleton
3. **错误处理**: 考虑添加错误边界
4. **测试**: 确保代码分割后功能正常

## 故障排查

### 问题 1: 页面加载失败

- 检查导入路径是否正确
- 检查组件是否默认导出
- 检查是否有循环依赖

### 问题 2: 代码没有被分割

- 检查 `dynamic` 是否正确使用
- 检查是否有其他同步导入
- 检查 Next.js 配置

### 问题 3: 类型错误

- 确保所有类型正确导入
- 检查 TypeScript 配置

---

**创建日期**: 2024-01-02  
**状态**: ✅ Users 页面已完成，其他页面待实现

