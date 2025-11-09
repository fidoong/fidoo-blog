# 权限系统使用指南

## 概述

本系统实现了基于 RBAC 的精细权限控制，支持：
- **系统权限**：控制 API 访问
- **菜单权限**：控制菜单显示
- **按钮权限**：控制按钮操作

## 前端使用

### 1. 获取用户权限

```typescript
import { useUserPermissions, useHasPermission } from '@/hooks/usePermissions';

// 获取所有权限
const { data: permissions } = useUserPermissions();

// 检查单个权限
const canCreate = useHasPermission('users:create');
```

### 2. 获取用户菜单

侧边栏已自动从 API 获取菜单，无需手动处理。

```typescript
import { useUserMenus } from '@/hooks/usePermissions';

const { data: menus } = useUserMenus();
```

### 3. 按钮权限控制

```typescript
import { useHasPermission } from '@/hooks/usePermissions';

function MyComponent() {
  const canCreate = useHasPermission('users:create');
  const canDelete = useHasPermission('users:delete');

  return (
    <div>
      {canCreate && (
        <Button onClick={handleCreate}>创建用户</Button>
      )}
      {canDelete && (
        <Button onClick={handleDelete}>删除</Button>
      )}
    </div>
  );
}
```

### 4. 条件渲染

```typescript
import { useHasPermission } from '@/hooks/usePermissions';

function UserList() {
  const canEdit = useHasPermission('users:update');
  const canDelete = useHasPermission('users:delete');

  return (
    <table>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
          {canEdit && (
            <td>
              <Button onClick={() => editUser(user.id)}>编辑</Button>
            </td>
          )}
          {canDelete && (
            <td>
              <Button onClick={() => deleteUser(user.id)}>删除</Button>
            </td>
          )}
        </tr>
      ))}
    </table>
  );
}
```

## 后端使用

### 1. 使用权限装饰器

```typescript
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  @Post()
  @Permissions('users:create')
  create(@Body() createUserDto: CreateUserDto) {
    // 需要 users:create 权限
  }

  @Get()
  @Permissions('users:view')
  findAll() {
    // 需要 users:view 权限
  }

  @Put(':id')
  @Permissions('users:update')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // 需要 users:update 权限
  }

  @Delete(':id')
  @Permissions('users:delete')
  remove(@Param('id') id: string) {
    // 需要 users:delete 权限
  }
}
```

### 2. 权限编码规范

格式：`资源:操作`

示例：
- `users:create` - 创建用户
- `users:update` - 更新用户
- `users:delete` - 删除用户
- `users:view` - 查看用户
- `posts:publish` - 发布文章
- `system:config` - 系统配置

## 管理界面

### 角色管理 (`/system/roles`)

- 创建角色
- 编辑角色信息
- 分配权限和菜单（需要在编辑时实现）
- 删除角色（系统角色不可删除）

### 权限管理 (`/system/permissions`)

- 创建权限
- 编辑权限信息
- 删除权限
- 按类型分组显示

### 菜单管理 (`/system/menus`)

- 创建菜单（支持树形结构）
- 编辑菜单信息
- 删除菜单
- 树形展示菜单结构

## 初始化步骤

1. **运行数据库迁移**
   ```bash
   cd service
   npm run migration:run
   ```

2. **初始化权限数据**
   ```bash
   cd service
   npx ts-node src/database/seeds/init-permission-system.ts
   ```

3. **为现有用户分配角色**
   通过角色管理界面为现有用户分配角色，或直接操作数据库。

## 注意事项

1. **权限缓存**：前端权限和菜单有 5 分钟缓存，修改权限后可能需要等待或刷新
2. **菜单图标**：菜单图标使用 lucide-react，图标名称需要与组件名称一致
3. **权限检查**：后端使用 `@Permissions()` 装饰器，前端使用 `useHasPermission` hook
4. **菜单树**：菜单支持无限层级，注意性能优化

## 扩展功能

### 添加新权限

1. 在权限管理界面创建新权限
2. 在对应的 Controller 添加 `@Permissions()` 装饰器
3. 在前端使用 `useHasPermission` 检查权限

### 添加新菜单

1. 在菜单管理界面创建新菜单
2. 设置菜单路径、组件、图标等信息
3. 为相应角色分配菜单权限

### 角色权限分配

目前角色管理页面支持创建和编辑角色，权限和菜单分配功能需要在编辑对话框中实现多选组件。

