# API 文档

## 基本信息

- Base URL: `http://localhost:3000/api/v1`
- 认证方式: Bearer Token (JWT)
- 数据格式: JSON

## 认证相关

### 用户注册

```http
POST /auth/register
```

**请求体**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123!",
  "nickname": "John Doe"
}
```

### 用户登录

```http
POST /auth/login
```

**请求体**

```json
{
  "username": "johndoe",
  "password": "Password123!"
}
```

**响应**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": "7d"
  }
}
```

### 刷新令牌

```http
POST /auth/refresh
```

### 获取当前用户

```http
GET /auth/profile
Authorization: Bearer {token}
```

## 文章管理

### 获取文章列表

```http
GET /posts?page=1&limit=10&status=published&categoryId=uuid&keyword=search
```

**查询参数**

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `status`: 文章状态 (draft, published, archived)
- `categoryId`: 分类 ID
- `keyword`: 搜索关键词

### 获取文章详情

```http
GET /posts/:id
```

### 通过 slug 获取文章

```http
GET /posts/slug/:slug
```

### 创建文章

```http
POST /posts
Authorization: Bearer {token}
```

**请求体**

```json
{
  "title": "文章标题",
  "slug": "article-slug",
  "summary": "文章摘要",
  "content": "文章内容...",
  "coverImage": "https://...",
  "status": "published",
  "categoryId": "uuid",
  "tagIds": ["uuid1", "uuid2"],
  "isFeatured": false,
  "isTop": false
}
```

### 更新文章

```http
PATCH /posts/:id
Authorization: Bearer {token}
```

### 删除文章

```http
DELETE /posts/:id
Authorization: Bearer {token}
```

### 增加浏览量

```http
POST /posts/:id/view
```

### 文章点赞

```http
POST /posts/:id/like
```

## 分类管理

### 获取所有分类

```http
GET /categories
```

### 创建分类

```http
POST /categories
Authorization: Bearer {token}
```

**请求体**

```json
{
  "name": "技术",
  "slug": "tech",
  "description": "技术相关文章",
  "sortOrder": 0
}
```

## 标签管理

### 获取所有标签

```http
GET /tags
```

### 创建标签

```http
POST /tags
Authorization: Bearer {token}
```

**请求体**

```json
{
  "name": "TypeScript",
  "slug": "typescript",
  "color": "#007ACC"
}
```

## 评论管理

### 获取文章评论

```http
GET /comments/post/:postId?status=approved
```

### 创建评论

```http
POST /comments
Authorization: Bearer {token}
```

**请求体**

```json
{
  "content": "评论内容",
  "postId": "uuid",
  "parentId": "uuid" // 可选，回复评论
}
```

### 审核评论

```http
POST /comments/:id/approve
Authorization: Bearer {token}
```

### 拒绝评论

```http
POST /comments/:id/reject
Authorization: Bearer {token}
```

## 媒体管理

### 上传文件

```http
POST /media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**表单数据**

- `file`: 文件

### 获取媒体列表

```http
GET /media?page=1&limit=20&type=image
```

**查询参数**

- `type`: 媒体类型 (image, video, audio, document)

### 删除媒体

```http
DELETE /media/:id
Authorization: Bearer {token}
```

## 用户管理

### 获取用户列表

```http
GET /users?page=1&limit=10
Authorization: Bearer {token}
```

### 获取用户详情

```http
GET /users/:id
Authorization: Bearer {token}
```

### 更新用户

```http
PATCH /users/:id
Authorization: Bearer {token}
```

### 删除用户

```http
DELETE /users/:id
Authorization: Bearer {token}
```

## 系统管理

### 获取系统信息

```http
GET /system/info
Authorization: Bearer {token}
```

### 获取进程信息

```http
GET /system/process
Authorization: Bearer {token}
```

### 健康检查

```http
GET /health
```

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应

```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/posts",
  "method": "POST",
  "message": "错误信息",
  "errors": {...} // 可选，验证错误详情
}
```

## 状态码

- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `429` - 请求过于频繁
- `500` - 服务器错误

## 更多信息

启动服务后访问 Swagger 文档：

- URL: http://localhost:3000/api/docs
- JSON: http://localhost:3000/api/docs-json
