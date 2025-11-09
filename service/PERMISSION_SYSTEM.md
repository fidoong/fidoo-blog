# 权限系统设计文档

## 概述

本系统实现了一个基于 RBAC (Role-Based Access Control) 的精细权限控制系统，支持：
- **系统权限**：控制用户对系统功能的访问
- **菜单权限**：控制用户可见的菜单项
- **按钮权限**：控制用户可操作的按钮和功能

## 数据库设计

### 核心实体

1. **Menu (菜单)**
   - 支持树形结构（父子关系）
   - 支持菜单、按钮、外链三种类型
   - 可关联权限编码

2. **Permission (权限)**
   - 支持菜单权限、按钮权限、API权限、数据权限
   - 通过 resource 和 action 标识资源操作
   - 支持权限分组（父子关系）

3. **Role (角色)**
   - 角色编码唯一
   - 支持系统角色（不可删除）
   - 可关联多个权限和菜单

4. **UserRole (用户角色关联)**
   - 多对多关系
   - 一个用户可以有多个角色

5. **RolePermission (角色权限关联)**
   - 多对多关系
   - 一个角色可以有多个权限

6. **RoleMenu (角色菜单关联)**
   - 多对多关系
   - 一个角色可以有多个菜单

## API 接口

### 菜单管理
- `POST /menus` - 创建菜单
- `GET /menus` - 获取菜单列表
- `GET /menus/tree` - 获取菜单树
- `GET /menus/:id` - 获取菜单详情
- `PUT /menus/:id` - 更新菜单
- `DELETE /menus/:id` - 删除菜单

### 权限管理
- `POST /permissions` - 创建权限
- `GET /permissions` - 获取权限列表
- `GET /permissions/:id` - 获取权限详情
- `PUT /permissions/:id` - 更新权限
- `DELETE /permissions/:id` - 删除权限

### 角色管理
- `POST /roles` - 创建角色（可同时分配权限和菜单）
- `GET /roles` - 获取角色列表
- `GET /roles/:id` - 获取角色详情
- `PUT /roles/:id` - 更新角色（可更新权限和菜单）
- `DELETE /roles/:id` - 删除角色

### 用户权限
- `GET /auth/permissions` - 获取当前用户权限列表
- `GET /auth/menus` - 获取当前用户菜单列表

## 使用方式

### 1. 权限装饰器

在 Controller 中使用 `@Permissions()` 装饰器：

```typescript
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  @Post()
  @Permissions('users:create')
  create() {
    // 需要 users:create 权限
  }

  @Get()
  @Permissions('users:view')
  findAll() {
    // 需要 users:view 权限
  }
}
```

### 2. 权限编码规范

权限编码格式：`资源:操作`

示例：
- `users:create` - 创建用户
- `users:update` - 更新用户
- `users:delete` - 删除用户
- `users:view` - 查看用户
- `posts:publish` - 发布文章
- `system:config` - 系统配置

### 3. 菜单权限关联

菜单可以通过 `permissionCode` 字段关联权限，前端可以根据权限显示/隐藏菜单。

### 4. 按钮权限

按钮权限通过权限编码控制，前端可以调用 `GET /auth/permissions` 获取用户权限列表，然后根据权限显示/隐藏按钮。

## 迁移步骤

1. **创建数据库迁移**
   ```bash
   npm run migration:generate -- -n CreatePermissionSystem
   npm run migration:run
   ```

2. **初始化数据**
   - 创建系统角色（admin, editor, user）
   - 创建基础权限
   - 创建菜单结构
   - 为管理员角色分配所有权限

3. **更新现有代码**
   - 将 `@Roles()` 装饰器替换为 `@Permissions()`
   - 更新前端菜单显示逻辑
   - 更新前端按钮权限控制

## 注意事项

1. **向后兼容**：User 实体保留了 `role` 字段，新系统使用 `userRoles` 关联
2. **系统角色**：标记为 `isSystem: true` 的角色不能删除
3. **权限缓存**：建议对用户权限进行缓存，提高性能
4. **菜单树**：菜单支持无限层级，注意性能优化

## 前端集成

前端需要：
1. 调用 `GET /auth/menus` 获取用户菜单
2. 调用 `GET /auth/permissions` 获取用户权限
3. 根据权限控制菜单显示和按钮显示
4. 在 API 请求中携带权限信息（可选）

