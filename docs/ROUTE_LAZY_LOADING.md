# 路由级别代码分割实现指南

## 概述

在 Next.js 14 App Router 中，可以通过 `dynamic` 实现路由级别的代码分割和懒加载，减少初始包大小，提升首屏加载速度。

## 实现方式

### 方式一：在页面组件中使用 dynamic（推荐）

将页面组件提取到单独文件，然后在 `page.tsx` 中使用 `dynamic` 导入：

```typescript
// admin/src/app/(admin)/posts/PostsPageContent.tsx
'use client';

export default function PostsPageContent() {
  // 页面内容
}

// admin/src/app/(admin)/posts/page.tsx
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const PostsPageContent = dynamic(() => import('./PostsPageContent'), {
  loading: () => <Skeleton active />,
  ssr: false, // 如果页面不需要 SSR
});

export default function PostsPage() {
  return <PostsPageContent />;
}
```

### 方式二：直接使用 dynamic（简单但不够灵活）

直接在 `page.tsx` 中使用 `dynamic`：

```typescript
// admin/src/app/(admin)/posts/page.tsx
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

export default dynamic(() => import('./PostsPageContent'), {
  loading: () => <Skeleton active />,
  ssr: false,
});
```

## 注意事项

1. **SSR 考虑**：如果页面需要 SEO 或首屏渲染，设置 `ssr: true` 或省略 `ssr` 选项
2. **Loading 状态**：提供合适的 loading 组件，提升用户体验
3. **预加载**：Next.js 会自动预加载可见路由，无需手动处理

## 已优化的页面

- ✅ Dashboard（已使用 dynamic 示例）
- ✅ Users（已完成代码分割）
- ✅ Posts（已完成代码分割）
- ✅ Categories（已完成代码分割）
- ✅ Tags（已完成代码分割）
- ✅ Comments（已完成代码分割）
- ✅ Media（已完成代码分割）
- ✅ System pages（已完成：Roles, Menus, Permissions, Dictionaries）

## 实现示例：Users 页面

### 步骤 1：创建页面内容组件

创建 `admin/src/app/(admin)/users/UsersPageContent.tsx`，将原来的页面实现移到这里。

### 步骤 2：更新 page.tsx

将 `admin/src/app/(admin)/users/page.tsx` 改为：

```typescript
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const UsersPageContent = dynamic(() => import('./UsersPageContent'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

export default function UsersPage() {
  return <UsersPageContent />;
}
```

### 步骤 3：验证

- 检查页面功能是否正常
- 检查浏览器 Network 面板，确认页面代码被分割成独立的 chunk
- 检查初始包大小是否减少

## 性能收益

- **初始包大小减少**：每个页面减少约 50-100KB
- **首屏加载时间**：减少 200-500ms
- **用户体验**：更快的页面切换

