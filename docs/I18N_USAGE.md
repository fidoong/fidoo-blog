# i18n 国际化使用指南

本文档介绍如何在 Fidoo Blog 项目中使用国际化（i18n）功能。

## 概述

项目已为以下部分配置了国际化支持：

1. **后端服务 (service)**：使用 `nestjs-i18n`
2. **前端前台 (web)**：使用 `next-intl`
3. **管理中台 (admin)**：使用 `next-intl`

## 支持的语言

- `zh-CN`：简体中文（默认）
- `en-US`：英语

## 后端使用

### 1. 抛出带 i18n 的异常

```typescript
import { BusinessException } from '@/common';

// 方式一：使用翻译键（推荐）
throw BusinessException.notFound('errors.userNotFound');
throw BusinessException.unauthorized('errors.usernameOrPasswordError');
throw BusinessException.conflict('errors.usernameExists', { field: 'username' });

// 方式二：直接使用消息（向后兼容）
throw BusinessException.notFound('用户不存在');
```

### 2. 在服务中使用 i18n

```typescript
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MyService {
  constructor(private readonly i18n: I18nService) {}

  async someMethod() {
    // 获取翻译
    const message = this.i18n.translate('errors.userNotFound', {
      lang: 'en-US', // 可选，默认使用请求语言
    });
  }
}
```

### 3. 语言检测

后端会自动从以下位置检测语言（优先级从高到低）：

1. 查询参数：`?lang=zh-CN` 或 `?locale=zh-CN` 或 `?l=zh-CN`
2. 请求头：`X-Custom-Lang: zh-CN`
3. Accept-Language 头：`Accept-Language: zh-CN,zh;q=0.9,en;q=0.8`
4. 默认语言：`zh-CN`

### 4. 添加新的翻译

在 `service/src/i18n/{locale}/common.json` 中添加新的翻译键：

```json
{
  "errors": {
    "myCustomError": "自定义错误消息"
  }
}
```

## 前端使用

### 1. 在组件中使用翻译

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <div>
      <button>{t('submit')}</button>
      <p>{t('loading')}</p>
    </div>
  );
}
```

### 2. 在服务端组件中使用翻译

```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('common');
  
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

### 3. 语言切换

前端使用中间件自动检测语言，也可以通过 URL 路径切换：

- 中文：`/` 或 `/zh-CN/...`
- 英文：`/en-US/...`

### 4. 添加新的翻译

在 `web/src/messages/{locale}/common.json` 或 `admin/src/messages/{locale}/common.json` 中添加：

```json
{
  "common": {
    "myNewKey": "新翻译"
  }
}
```

## API 请求中的语言设置

前端在发送 API 请求时，可以通过以下方式指定语言：

### 方式一：查询参数

```typescript
fetch('/api/users?lang=en-US');
```

### 方式二：请求头

```typescript
fetch('/api/users', {
  headers: {
    'X-Custom-Lang': 'en-US',
  },
});
```

### 方式三：Accept-Language 头

```typescript
fetch('/api/users', {
  headers: {
    'Accept-Language': 'en-US,en;q=0.9',
  },
});
```

## 最佳实践

1. **优先使用翻译键**：在抛出异常时，优先使用翻译键而不是硬编码的消息
2. **统一翻译键命名**：使用命名空间，如 `errors.xxx`、`success.xxx`、`common.xxx`
3. **保持翻译文件同步**：添加新功能时，确保所有语言都有对应的翻译
4. **测试多语言**：在开发过程中测试不同语言下的显示效果

## 文件结构

```
service/
  src/
    i18n/
      zh-CN/
        common.json
      en-US/
        common.json
      i18n.module.ts

web/
  src/
    i18n/
      routing.ts
      request.ts
    messages/
      zh-CN/
        common.json
      en-US/
        common.json
    middleware.ts

admin/
  src/
    i18n/
      routing.ts
      request.ts
    messages/
      zh-CN/
        common.json
      en-US/
        common.json
    middleware.ts
```

## 示例：完整的错误处理流程

### 后端

```typescript
// service/src/modules/users/users.service.ts
throw BusinessException.notFound('errors.userNotFound');
```

### 前端

```typescript
// web/src/components/UserProfile.tsx
'use client';

import { useTranslations } from 'next-intl';

export function UserProfile() {
  const t = useTranslations('errors');
  
  // API 返回的错误消息已经根据语言自动翻译
  // 前端可以直接显示
  return <div>{error.message}</div>;
}
```

## 注意事项

1. 后端异常过滤器会自动处理翻译，无需手动调用 i18n 服务
2. 前端中间件会自动处理语言路由，无需手动配置
3. 默认语言（zh-CN）在 URL 中不显示前缀
4. 确保所有翻译文件的结构保持一致

