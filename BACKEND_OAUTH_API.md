# 后端 OAuth API 设计文档

## 概述

本文档描述了后端需要实现的 OAuth 授权相关 API 接口，用于支持 GitHub 和微信登录功能。

## API 接口

### 1. GitHub OAuth 授权

#### GET `/auth/github`

获取 GitHub OAuth 授权 URL 并重定向用户到 GitHub 授权页面。

**查询参数：**
- `redirect_uri` (string, required): 授权成功后的前端回调地址

**响应：**
- 重定向到 GitHub OAuth 授权页面

**流程说明：**
1. 前端调用：`GET /auth/github?redirect_uri=http://localhost:3000/auth/callback?provider=github`
2. 后端生成 state（用于 CSRF 保护）并存储到 session
3. 后端重定向到 GitHub OAuth 授权页面
4. 用户授权后，GitHub 回调到后端：`GET /auth/github/callback?code=xxx&state=xxx`
5. 后端验证 state，使用 code 换取 access_token
6. 使用 access_token 获取用户信息
7. 创建/更新用户，生成 JWT token
8. 后端重定向到前端：`{redirect_uri}&token={jwt_token}` 或 `{redirect_uri}&code={code}`（前端再用 code 调用接口）

**示例：**
```
GET /auth/github?redirect_uri=http://localhost:3000/auth/callback?provider=github
```

#### POST `/auth/github/callback`

处理 GitHub OAuth 回调，获取用户信息并创建/登录用户。

**请求体：**
```json
{
  "code": "github_authorization_code"
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "user": {
      "id": "user_id",
      "username": "github_username",
      "email": "user@example.com",
      "nickname": "User Name",
      "avatar": "https://avatars.githubusercontent.com/u/xxx",
      "role": "user",
      "status": "active"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": "3600"
  },
  "message": "登录成功"
}
```

### 2. 微信 OAuth 授权

#### GET `/auth/wechat`

获取微信 OAuth 授权 URL 并重定向用户到微信授权页面。

**查询参数：**
- `redirect_uri` (string, required): 授权成功后的前端回调地址

**响应：**
- 重定向到微信 OAuth 授权页面

**流程说明：**
1. 前端调用：`GET /auth/wechat?redirect_uri=http://localhost:3000/auth/callback?provider=wechat`
2. 后端生成 state（用于 CSRF 保护）并存储到 session
3. 后端重定向到微信 OAuth 授权页面
4. 用户授权后，微信回调到后端：`GET /auth/wechat/callback?code=xxx&state=xxx`
5. 后端验证 state，使用 code 换取 access_token 和 openid
6. 使用 access_token 和 openid 获取用户信息
7. 创建/更新用户，生成 JWT token
8. 后端重定向到前端：`{redirect_uri}&token={jwt_token}` 或 `{redirect_uri}&code={code}`（前端再用 code 调用接口）

**示例：**
```
GET /auth/wechat?redirect_uri=http://localhost:3000/auth/callback?provider=wechat
```

#### POST `/auth/wechat/callback`

处理微信 OAuth 回调，获取用户信息并创建/登录用户。

**请求体：**
```json
{
  "code": "wechat_authorization_code"
}
```

**响应：**
```json
{
  "code": 0,
  "data": {
    "user": {
      "id": "user_id",
      "username": "wechat_openid",
      "email": null,
      "nickname": "微信昵称",
      "avatar": "https://thirdwx.qlogo.cn/xxx",
      "role": "user",
      "status": "active"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": "3600"
  },
  "message": "登录成功"
}
```

## 实现要点

### 1. GitHub OAuth 流程

**方式一（推荐）：后端直接返回 token**
1. 用户点击 GitHub 登录按钮
2. 前端重定向到 `/auth/github?redirect_uri=...`
3. 后端生成 GitHub OAuth URL 并重定向用户
4. 用户在 GitHub 授权后，GitHub 回调到后端：`/auth/github/callback?code=xxx&state=xxx`
5. 后端验证 state，使用 `code` 换取 `access_token`
6. 使用 `access_token` 获取用户信息
7. 检查用户是否已存在（通过 GitHub ID 或邮箱）
8. 如果不存在，创建新用户；如果存在，更新用户信息
9. 生成 JWT token 并重定向到前端：`{redirect_uri}&token={jwt_token}`
10. 前端从 URL 参数获取 token，调用 `/auth/profile` 获取用户信息并完成登录

**方式二：前端使用 code 换取 token**
1-8 步骤同上
9. 后端重定向到前端：`{redirect_uri}&code={code}&provider=github`
10. 前端调用 `POST /auth/github/callback` 传入 code
11. 后端返回 token 和用户信息
12. 前端完成登录

### 2. 微信 OAuth 流程

1. 用户点击微信登录按钮
2. 前端重定向到 `/auth/wechat?redirect_uri=...`
3. 后端生成微信 OAuth URL 并重定向用户
4. 用户在微信授权后，微信回调到后端配置的回调地址
5. 后端使用 `code` 换取 `access_token` 和 `openid`
6. 使用 `access_token` 和 `openid` 获取用户信息
7. 检查用户是否已存在（通过微信 openid）
8. 如果不存在，创建新用户；如果存在，更新用户信息
9. 生成 JWT token 并重定向到前端回调页面

### 3. 用户创建/更新逻辑

- **GitHub**: 使用 GitHub ID 或邮箱作为唯一标识
- **微信**: 使用 openid 作为唯一标识
- 如果用户已存在，更新头像、昵称等信息
- 如果用户不存在，创建新用户，用户名可以使用 `github_${github_id}` 或 `wechat_${openid}` 格式

### 4. 环境变量配置

后端需要配置以下环境变量：

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback

# 微信 OAuth
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
WECHAT_CALLBACK_URL=http://localhost:3001/auth/wechat/callback
```

## 错误处理

所有接口都应该返回统一的错误格式：

```json
{
  "code": 1,
  "message": "错误描述",
  "data": null
}
```

常见错误：
- `code: 1, message: "授权失败"`
- `code: 1, message: "获取用户信息失败"`
- `code: 1, message: "用户创建失败"`

## 安全考虑

1. **CSRF 保护**: 使用 state 参数防止 CSRF 攻击
2. **Token 安全**: JWT token 应该设置合理的过期时间
3. **用户隐私**: 妥善处理第三方平台的用户信息
4. **重定向验证**: 验证 redirect_uri 是否在白名单中

