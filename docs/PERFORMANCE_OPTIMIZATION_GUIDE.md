# 性能优化使用指南

本文档介绍如何使用新增的性能优化功能。

## 1. 防抖 Hook (useDebounce)

用于延迟执行函数，常用于搜索输入等场景。

### 使用示例

```tsx
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks';
import { useTable } from '@/hooks';

export default function SearchPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedKeyword = useDebounce(searchKeyword, 500); // 500ms 防抖

  const table = useTable({
    queryKey: ['items'],
    queryFn: async (params) => {
      return await api.getItems({ ...params, keyword: debouncedKeyword });
    },
  });

  // 当防抖后的关键词变化时，自动触发搜索
  useEffect(() => {
    if (debouncedKeyword) {
      table.setParams({ keyword: debouncedKeyword });
    }
  }, [debouncedKeyword]);

  return (
    <Input
      value={searchKeyword}
      onChange={(e) => setSearchKeyword(e.target.value)}
      placeholder="搜索..."
    />
  );
}
```

## 2. 乐观更新 Hook (useOptimisticMutation)

在数据更新时立即更新 UI，如果失败则回滚。

### 使用示例

```tsx
import { useOptimisticMutation } from '@/hooks';
import { usersApi } from '@/lib/api/users';
import { useQueryClient } from '@tanstack/react-query';

export default function UserPage() {
  const queryClient = useQueryClient();

  const updateMutation = useOptimisticMutation({
    queryKey: ['users'],
    mutationFn: (data) => usersApi.updateUser(id, data),
    onMutate: async (newData) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['users'] });
      
      // 保存当前数据快照
      const previousData = queryClient.getQueryData(['users']);
      
      // 乐观更新
      queryClient.setQueryData(['users'], (old: any) => ({
        ...old,
        items: old.items.map((item: User) => 
          item.id === id ? { ...item, ...newData } : item
        ),
      }));
      
      return { previousData };
    },
    successMessage: '更新成功',
  });

  const handleUpdate = () => {
    updateMutation.mutate({ username: 'newName' });
  };

  return <Button onClick={handleUpdate}>更新</Button>;
}
```

## 3. 错误处理 Hook (useErrorHandler)

提供统一的错误处理功能。

### 使用示例

```tsx
import { useErrorHandler } from '@/hooks';

export default function MyComponent() {
  const { handleError, handleSuccess } = useErrorHandler();

  const handleSubmit = async () => {
    try {
      await api.createItem(data);
      handleSuccess('创建成功');
    } catch (error) {
      handleError(error, '创建失败，请稍后重试');
    }
  };

  return <Button onClick={handleSubmit}>提交</Button>;
}
```

## 4. 错误边界组件

自动捕获 React 组件树中的错误。

### 使用方式

错误边界已经在根布局中集成，无需额外配置。

如果需要自定义错误处理：

```tsx
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

<ErrorBoundary
  onError={(error, errorInfo) => {
    // 自定义错误处理逻辑
    console.error('Custom error handling:', error, errorInfo);
  }}
  fallback={<CustomErrorComponent />}
>
  <YourComponent />
</ErrorBoundary>
```

## 5. 错误提示组件

用于显示友好的错误消息。

### 使用示例

```tsx
import { ErrorAlert } from '@/components/error/ErrorAlert';

export default function MyComponent() {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <ErrorAlert
        error={error}
        onRetry={() => {
          setError(null);
          // 重试逻辑
        }}
      />
    );
  }

  return <div>Content</div>;
}
```

## 6. 表格骨架屏

用于在数据加载时显示占位内容。

### 使用示例

```tsx
import { TableSkeleton } from '@/components/skeleton';

export default function UsersPage() {
  const { data, isLoading } = useTable({ ... });

  if (isLoading) {
    return <TableSkeleton columns={5} rows={5} />;
  }

  return <Table dataSource={data} />;
}
```

## 7. 代码分割和懒加载

使用 Next.js 的 `dynamic` 进行代码分割：

```tsx
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

// 懒加载表格组件
const UsersTable = dynamic(() => import('@/components/users/UsersTable'), {
  loading: () => <Skeleton active />,
  ssr: false,
});

export default function UsersPage() {
  return <UsersTable />;
}
```

## 最佳实践

1. **搜索输入**: 使用 `useDebounce` 减少不必要的 API 调用
2. **数据更新**: 使用 `useOptimisticMutation` 提升用户体验
3. **错误处理**: 统一使用 `useErrorHandler` 处理错误
4. **加载状态**: 使用骨架屏替代简单的 Loading
5. **代码分割**: 对大型组件使用懒加载

## 性能优化检查清单

- [ ] 搜索输入已使用防抖
- [ ] 数据更新已使用乐观更新
- [ ] 错误处理已统一
- [ ] 加载状态已使用骨架屏
- [ ] 大型组件已使用懒加载
- [ ] 图片已使用 Next.js Image 组件
- [ ] 不必要的重渲染已优化

