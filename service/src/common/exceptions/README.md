# 业务异常处理

## 概述

后端使用统一的业务异常格式返回给前端，格式如下：

```json
{
  "code": 400,
  "message": "错误消息",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

- `code`: 业务错误码，0 表示成功，非 0 表示业务失败
- `message`: 错误消息
- `data`: 错误详情数据（可选）
- `timestamp`: 时间戳

## 设计理念

### HTTP 状态码 vs 业务错误码

**核心原则：**

- **HTTP 状态码**：表示请求是否成功到达服务器并被处理
  - `200 OK`：请求成功到达服务器并被处理（无论业务是否成功）
  - `404 Not Found`：路由不存在（真正的 HTTP 错误）
  - `500 Internal Server Error`：服务器内部错误（代码异常）

- **业务错误码（code）**：表示业务逻辑的执行结果
  - `0`：成功`
  - `非 0`：业务失败（如密码错误、资源不存在等）

### 示例对比

**业务错误（密码错误）：**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "code": 401,
  "message": "用户名或密码错误",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**HTTP 错误（路由不存在）：**

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "code": 404,
  "message": "Cannot GET /api/v1/invalid-route",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**系统错误（代码异常）：**

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "code": 500,
  "message": "服务器内部错误",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 使用方式

### 1. 使用 BusinessException 类（推荐）

```typescript
import { BusinessException } from '@/common';

// 方式一：使用静态方法（推荐）
throw BusinessException.badRequest('用户名或密码错误');
throw BusinessException.notFound('文章不存在');
throw BusinessException.unauthorized('未授权');
throw BusinessException.conflict('用户名已存在');
throw BusinessException.validationError('验证失败', { field: 'email', reason: '格式不正确' });

// 方式二：使用构造函数
throw new BusinessException({
  code: 400,
  message: '自定义错误消息',
  data: { field: 'username' },
});
```

### 2. 使用 NestJS 内置异常（不推荐用于业务错误）

```typescript
import { BadRequestException, NotFoundException } from '@nestjs/common';

// ⚠️ 注意：这些异常会返回对应的 HTTP 状态码（如 400、404）
// 仅用于真正的 HTTP 错误（如路由不存在、验证失败等）
// 业务错误应该使用 BusinessException
throw new BadRequestException('参数错误'); // HTTP 400
throw new NotFoundException('资源不存在'); // HTTP 404
```

## 业务错误码

| 错误码 | HTTP 状态码 | 说明           | 使用场景                                            |
| ------ | ----------- | -------------- | --------------------------------------------------- |
| 0      | 200         | 成功           | 业务操作成功                                        |
| 400    | 200         | 请求参数错误   | 业务层面的参数验证失败                              |
| 401    | 200         | 未授权         | 密码错误、token 无效等业务错误                      |
| 403    | 200         | 禁止访问       | 权限不足等业务错误                                  |
| 404    | 200         | 资源不存在     | 业务层面的资源不存在（如用户不存在）                |
| 409    | 200         | 资源冲突       | 业务层面的资源冲突（如用户名已存在）                |
| 422    | 200         | 验证错误       | 业务层面的数据验证失败                              |
| 500    | 200         | 服务器内部错误 | 业务层面的内部错误（真正的系统错误会返回 HTTP 500） |

**注意：**

- 所有业务异常（`BusinessException`）都返回 **HTTP 200**，错误通过 `code` 字段表示
- 只有真正的 HTTP 错误（路由不存在、代码异常等）才会返回非 200 状态码

## 示例

### 示例 1：登录验证

```typescript
async login(loginDto: LoginDto) {
  const user = await this.usersService.findByUsername(loginDto.username);

  if (!user) {
    throw BusinessException.unauthorized('用户名或密码错误');
  }

  const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
  if (!isPasswordValid) {
    throw BusinessException.unauthorized('用户名或密码错误');
  }

  // ... 返回 token
}
```

### 示例 2：资源不存在

```typescript
async findOne(id: string) {
  const post = await this.postsRepository.findOne({ where: { id } });

  if (!post) {
    throw BusinessException.notFound('文章不存在');
  }

  return post;
}
```

### 示例 3：资源冲突

```typescript
async create(createUserDto: CreateUserDto) {
  const existingUser = await this.usersRepository.findOne({
    where: { username: createUserDto.username }
  });

  if (existingUser) {
    throw BusinessException.conflict('用户名已存在');
  }

  // ... 创建用户
}
```

### 示例 4：带详细错误信息

```typescript
async validateEmail(email: string) {
  const errors = [];

  if (!email) {
    errors.push({ field: 'email', message: '邮箱不能为空' });
  }

  if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: '邮箱格式不正确' });
  }

  if (errors.length > 0) {
    throw BusinessException.validationError('验证失败', { errors });
  }
}
```

## 异常过滤器

所有异常都会被 `HttpExceptionFilter` 捕获并转换为统一格式：

1. **`BusinessException`** - 返回 HTTP 200，使用业务错误码和消息
2. **`HttpException`** - 保持原有 HTTP 状态码（如 404、500），映射到业务错误码
3. **其他异常** - 返回 HTTP 500，转换为内部错误

### 处理流程

```
异常类型判断
    ↓
BusinessException → HTTP 200 + code（业务错误码）
    ↓
HttpException → HTTP 状态码（如 404、500）+ code（映射的业务错误码）
    ↓
Error → HTTP 500 + code: 500
```

## 前端处理

前端 axios 拦截器会自动处理错误响应：

```typescript
// 错误会被转换为 ApiError 格式
try {
  await api.post('/auth/login', data);
} catch (error) {
  // error.code: 业务错误码
  // error.message: 错误消息
  // error.data: 错误详情（如果有）
  console.error(error.code, error.message);
}
```
