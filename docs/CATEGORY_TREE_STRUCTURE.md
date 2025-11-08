# 分类树形结构重构说明

## 概述

本次重构将分类系统改为树形结构，支持大类 -> 分类 -> 标签的层级关系。

## 表结构变更

### Categories 表

新增字段：
- `parent_id` (UUID, nullable): 父分类 ID，null 表示是大类
- `level` (INTEGER, default: 0): 层级，0=大类，1=分类
- `icon` (VARCHAR(100), nullable): 图标名称或 URL，用于大类显示

移除约束：
- `name` 的唯一约束（允许同名子分类）

### Tags 表

新增字段：
- `category_id` (UUID, nullable): 所属分类 ID，可选关联到分类

## 数据结构

```
大类 (level=0, parent_id=null)
  ├── 分类 (level=1, parent_id=大类ID)
  │     ├── 标签 (category_id=分类ID)
  │     └── 标签
  └── 分类
        └── 标签
```

## API 接口

### Categories

- `GET /categories` - 获取所有分类（扁平列表）
- `GET /categories/tree` - 获取分类树形结构（大类及其子分类）
- `GET /categories/main` - 获取所有大类（level = 0）
- `GET /categories/parent/:parentId` - 根据父分类 ID 获取子分类
- `GET /categories/slug/:slug` - 通过 slug 获取分类详情（包含父分类和子分类）

### Tags

- `GET /tags` - 获取所有标签
- `GET /tags/category/:categoryId` - 根据分类 ID 获取标签
- `GET /tags/slug/:slug` - 通过 slug 获取标签详情

## 前端变更

### Header 导航
- 显示大类作为主导航菜单项
- 首页和关于页面保持不变

### Sidebar 侧边栏
- 显示树形分类结构
- 大类可展开/收起显示子分类
- 子分类下显示该分类的标签（最多5个）
- 底部显示所有热门标签

### 分类页面
- `/categories` - 显示所有大类，可展开查看子分类
- `/categories/[slug]` - 显示分类详情，包含父分类和子分类信息

## 数据库迁移

运行迁移以更新表结构：

```bash
cd service
pnpm migration:run
```

如果需要回滚：

```bash
pnpm migration:revert
```

## 使用示例

### 创建大类

```json
POST /categories
{
  "name": "科技",
  "slug": "tech",
  "description": "科技相关文章",
  "level": 0,
  "icon": "💻",
  "sortOrder": 1
}
```

### 创建子分类

```json
POST /categories
{
  "name": "前端开发",
  "slug": "frontend",
  "description": "前端开发相关",
  "parentId": "大类ID",
  "sortOrder": 1
}
```

### 创建标签（关联到分类）

```json
POST /tags
{
  "name": "React",
  "slug": "react",
  "color": "#61DAFB",
  "categoryId": "分类ID"
}
```

## 注意事项

1. 创建子分类时，如果不提供 `parentId`，系统会自动设置为大类（level=0）
2. 如果提供 `parentId`，系统会自动计算 `level` 为父分类的 level + 1
3. 标签可以独立存在（categoryId 为 null），也可以关联到分类
4. 删除大类时，会级联删除所有子分类（CASCADE）
5. 删除分类时，关联的标签的 categoryId 会被设置为 null（SET NULL）

