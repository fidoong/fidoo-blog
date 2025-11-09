# 乐观更新优化文档

## 概述

乐观更新（Optimistic Updates）是一种用户体验优化技术，在数据提交到服务器之前就立即更新 UI，让用户感觉操作更加流畅和快速。如果操作失败，则自动回滚到之前的状态。

## 实现原理

### 工作流程

1. **onMutate（乐观更新）**
   - 取消正在进行的查询
   - 保存当前数据快照
   - 立即更新 UI（乐观更新）

2. **onSuccess（成功确认）**
   - 显示成功消息
   - 刷新数据以获取服务器返回的完整数据
   - 执行成功回调

3. **onError（失败回滚）**
   - 回滚到之前的数据快照
   - 显示错误消息
   - 执行错误回调

## 已优化的 Hooks

### ✅ usePostsMutation

已为以下操作添加乐观更新：

- **Create（创建）**：在列表开头添加新项
- **Update（更新）**：更新列表中的对应项
- **Delete（删除）**：从列表中移除项
- **BatchDelete（批量删除）**：从列表中移除多项

### ✅ useUsersMutation

已为以下操作添加乐观更新：

- **Create（创建）**：在列表开头添加新项
- **Update（更新）**：更新列表中的对应项
- **Delete（删除）**：从列表中移除项
- **BatchDelete（批量删除）**：从列表中移除多项

### ✅ useCategoriesMutation

已为以下操作添加乐观更新：

- **Create（创建）**：在列表开头添加新项
- **Update（更新）**：更新列表中的对应项
- **Delete（删除）**：从列表中移除项
- **BatchDelete（批量删除）**：从列表中移除多项

### ✅ useTagsMutation

已为以下操作添加乐观更新：

- **Create（创建）**：在列表开头添加新项
- **Update（更新）**：更新列表中的对应项
- **Delete（删除）**：从列表中移除项
- **BatchDelete（批量删除）**：从列表中移除多项

### ✅ useCommentsMutation

已为以下操作添加乐观更新：

- **Create（创建）**：在列表开头添加新项
- **Update（更新）**：更新列表中的对应项
- **Delete（删除）**：从列表中移除项
- **Approve（审核通过）**：更新评论状态为已通过
- **Reject（拒绝）**：更新评论状态为已拒绝

### ✅ useMenusMutation

已为以下操作添加乐观更新：

- **Create（创建）**：在列表开头添加新项
- **Update（更新）**：更新列表中的对应项
- **Delete（删除）**：从列表中移除项
- **BatchDelete（批量删除）**：从列表中移除多项

### ✅ useRolesMutation

已为以下操作添加乐观更新：

- **Create（创建）**：在列表开头添加新项
- **Update（更新）**：更新列表中的对应项
- **Delete（删除）**：从列表中移除项
- **BatchDelete（批量删除）**：从列表中移除多项

### ✅ usePermissionsMutation

已为以下操作添加乐观更新：

- **Create（创建）**：在列表开头添加新项
- **Update（更新）**：更新列表中的对应项
- **Delete（删除）**：从列表中移除项
- **BatchDelete（批量删除）**：从列表中移除多项

### 实现示例

```typescript
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => postsApi.updatePost(id, data),
  onMutate: async ({ id, data: updateData }) => {
    // 取消正在进行的查询
    await queryClient.cancelQueries({ queryKey });

    // 保存当前数据快照
    const previousData = queryClient.getQueryData<PaginatedResponse<Post>>(queryKey);

    // 乐观更新：更新列表中的对应项
    if (previousData) {
      queryClient.setQueryData<PaginatedResponse<Post>>(queryKey, {
        ...previousData,
        items: previousData.items.map((item) =>
          item.id === id ? { ...item, ...updateData } : item,
        ),
      });
    }

    return { previousData };
  },
  onSuccess: async (data) => {
    message.success('更新成功');
    refreshData(); // 刷新以获取服务器返回的完整数据
  },
  onError: (error, _variables, context) => {
    // 回滚
    if (context?.previousData) {
      queryClient.setQueryData(queryKey, context.previousData);
    }
    message.error('更新失败');
  },
});
```

## 待优化的 Hooks

所有主要的 mutation hooks 已完成乐观更新优化！✅

## 性能收益

- **用户体验提升**：操作立即反馈，无需等待服务器响应
- **感知性能**：用户感觉应用更快、更流畅
- **错误处理**：自动回滚，确保数据一致性

## 注意事项

1. **数据一致性**：在 `onSuccess` 中刷新数据，确保 UI 与服务器数据一致
2. **错误处理**：必须实现 `onError` 回滚，防止数据不一致
3. **临时 ID**：创建操作时使用临时 ID，成功后再用服务器返回的真实 ID 替换
4. **并发处理**：使用 `cancelQueries` 避免并发更新冲突

## 最佳实践

1. **总是保存快照**：在 `onMutate` 中保存 `previousData`
2. **总是回滚**：在 `onError` 中检查并回滚 `previousData`
3. **刷新数据**：在 `onSuccess` 中刷新数据以确保一致性
4. **类型安全**：使用 TypeScript 类型确保数据结构的正确性

---

**最后更新**: 2024-01-02

