# 快速添加审计日志菜单

## 问题

如果登录后看不到"审计日志"菜单，可能是因为：
1. 数据库中没有审计日志菜单数据
2. 菜单没有分配给当前用户的角色

## 解决方案

### 方式一：如果权限系统已初始化（推荐）

如果系统已经运行过 `seed:permission`，只需要添加审计日志菜单：

```bash
cd service
pnpm run seed:audit-logs
```

这个脚本会：
- ✅ 检查并创建审计日志权限（如果不存在）
- ✅ 在系统管理菜单下添加审计日志子菜单
- ✅ 为管理员角色分配审计日志权限和菜单

### 方式二：重新初始化权限系统

如果系统是全新安装，或者可以接受重新初始化权限系统：

```bash
cd service
pnpm run seed:permission
```

⚠️ **注意**: 这会清空并重新创建所有权限、菜单和角色数据。

## 验证

运行脚本后：

1. **重新登录** admin 后台（菜单数据会缓存）
2. 检查系统管理菜单下是否有"审计日志"菜单项
3. 如果还是没有，检查：
   - 当前用户是否是管理员角色
   - 数据库中是否有 `menu:system:audit-logs` 菜单
   - 角色菜单关联表中是否有对应记录

## 手动检查数据库

如果需要手动检查数据库：

```sql
-- 检查菜单是否存在
SELECT * FROM menus WHERE code = 'menu:system:audit-logs';

-- 检查管理员角色
SELECT * FROM roles WHERE code = 'admin';

-- 检查角色菜单关联
SELECT rm.*, m.title, m.code 
FROM role_menus rm 
JOIN menus m ON rm.menu_id = m.id 
WHERE m.code = 'menu:system:audit-logs';

-- 检查用户角色
SELECT ur.*, r.name, r.code 
FROM user_roles ur 
JOIN roles r ON ur.role_id = r.id 
WHERE r.code = 'admin';
```

## 常见问题

### Q: 运行脚本后还是没有菜单？

A: 
1. 确保重新登录（菜单数据会缓存）
2. 检查当前用户是否是管理员角色
3. 检查数据库中是否有菜单和关联记录

### Q: 如何确认脚本执行成功？

A: 脚本会输出类似以下的信息：
```
✅ 创建了 8 个审计日志权限
✅ 创建了审计日志菜单
✅ 为管理员角色分配了审计日志菜单
✅ 审计日志菜单和权限添加完成
```

---

**创建日期**: 2024-01-02

