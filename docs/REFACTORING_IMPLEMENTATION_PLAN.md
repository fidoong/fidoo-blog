# 重构实施计划 - 详细步骤

本文档提供具体的重构实施步骤和代码示例。

## 📋 目录

1. [类型系统统一](#类型系统统一)
2. [错误处理优化](#错误处理优化)
3. [性能优化实施](#性能优化实施)
4. [测试框架搭建](#测试框架搭建)
5. [API 文档生成](#api-文档生成)

---

## 类型系统统一

### 步骤 1: 创建统一类型定义

**文件**: `admin/src/lib/api/types.ts`

```typescript
/**
 * 统一的 API 响应类型定义
 */

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 标准 API 响应
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  code: number;
  message: string;
  data?: unknown;
  timestamp: string;
}
```

### 步骤 2: 创建菜单类型定义

**文件**: `admin/src/types/menu.ts`

```typescript
/**
 * 菜单项类型定义
 */
export interface MenuItem {
  id: string;
  title: string;
  name: string;
  path?: string;
  icon?: string;
  status: 'enabled' | 'disabled';
  isHidden: boolean;
  children?: MenuItem[];
  permission?: string;
  sortOrder: number;
  parentId?: string;
  type?: 'menu' | 'button' | 'link';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 菜单树节点
 */
export type MenuTree = MenuItem[];
```

### 步骤 3: 重构 API 文件

**示例**: `admin/src/lib/api/users.ts`

```typescript
import { apiClient } from './client';
import type { PaginatedResponse } from './types';

// 删除本地的 PaginatedResponse 定义，改为导入
// export interface PaginatedResponse<T> { ... } // ❌ 删除

// 使用统一的类型
import type { PaginatedResponse } from './types'; // ✅ 导入

export const usersApi = {
  getUsers: async (params?: QueryUserDto): Promise<PaginatedResponse<User>> => {
    return apiClient.get<PaginatedResponse<User>>('/users', { params });
  },
  // ...
};
```

### 步骤 4: 更新所有 API 文件

需要更新的文件列表：
- `admin/src/lib/api/posts.ts`
- `admin/src/lib/api/categories.ts`
- `admin/src/lib/api/tags.ts`
- `admin/src/lib/api/comments.ts`
- `admin/src/lib/api/media.ts`
- `admin/src/lib/api/permissions.ts`
- `admin/src/lib/api/roles.ts`
- `admin/src/lib/api/menus.ts`
- `admin/src/lib/api/dictionaries.ts`
- `admin/src/lib/api/notifications.ts`

### 步骤 5: 更新菜单相关代码

**文件**: `admin/src/store/auth.ts`

```typescript
import type { MenuItem } from '@/types/menu';

interface AuthState {
  // ...
  menus: MenuItem[]; // 替换 any[]
  // ...
}
```

**文件**: `admin/src/components/layout/AdminLayout.tsx`

```typescript
import type { MenuItem } from '@/types/menu';

// 更新函数签名
const buildMenuItems = (menuList: MenuItem[]): MenuProps['items'] => {
  // ...
};
```

---

## 错误处理优化

### 步骤 1: 创建错误边界组件

**文件**: `admin/src/components/error/ErrorBoundary.tsx`

```typescript
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // 可以在这里发送错误到监控系统
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Result
          status="500"
          title="500"
          subTitle="抱歉，页面出现了错误"
          extra={[
            <Button type="primary" key="reload" onClick={this.handleReload}>
              刷新页面
            </Button>,
            <Button key="reset" onClick={this.handleReset}>
              重试
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}
```

### 步骤 2: 创建错误提示组件

**文件**: `admin/src/components/error/ErrorAlert.tsx`

```typescript
'use client';

import { Alert, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ErrorAlertProps {
  error: Error | unknown;
  onRetry?: () => void;
  title?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return '发生了未知错误';
}

export function ErrorAlert({ error, onRetry, title = '操作失败' }: ErrorAlertProps) {
  const errorMessage = getErrorMessage(error);

  return (
    <Alert
      message={title}
      description={errorMessage}
      type="error"
      showIcon
      action={
        onRetry && (
          <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
            重试
          </Button>
        )
      }
      closable
    />
  );
}
```

### 步骤 3: 创建错误处理 Hook

**文件**: `admin/src/hooks/useErrorHandler.ts`

```typescript
import { useCallback } from 'react';
import { message } from 'antd';

interface ApiError {
  code?: number;
  message?: string;
  data?: unknown;
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const apiError = error as ApiError;
    if (apiError.message) {
      return apiError.message;
    }
    if (apiError.code) {
      return `错误代码: ${apiError.code}`;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '操作失败，请稍后重试';
}

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage = customMessage || getErrorMessage(error);
    message.error(errorMessage);
    console.error('Error:', error);
  }, []);

  const handleSuccess = useCallback((msg: string = '操作成功') => {
    message.success(msg);
  }, []);

  return { handleError, handleSuccess };
}
```

### 步骤 4: 集成错误边界

**文件**: `admin/src/app/layout.tsx`

```typescript
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.variable} suppressHydrationWarning>
        <ErrorBoundary>
          <ConfigProvider locale={zhCN}>
            <Providers>
              <FormDialogProvider>
                <AuthProvider>{children}</AuthProvider>
              </FormDialogProvider>
            </Providers>
          </ConfigProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 步骤 5: 优化 API 客户端错误处理

**文件**: `packages/shared/src/api/client.ts`

```typescript
// 在 ApiClient 类中添加错误处理
class ApiClient {
  // ... 现有代码

  private handleError(error: unknown): never {
    // 统一错误处理逻辑
    if (axios.isAxiosError(error)) {
      const response = error.response;
      if (response) {
        const errorData = response.data as ErrorResponse;
        throw new ApiError(
          errorData.message || error.message,
          errorData.code || response.status,
          errorData.data
        );
      }
    }
    throw error;
  }
}
```

---

## 性能优化实施

### 步骤 1: 实现代码分割

**文件**: `admin/src/app/(admin)/posts/page.tsx`

```typescript
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

// 懒加载表格组件
const PostsTable = dynamic(() => import('@/components/post/PostsTable'), {
  loading: () => <Skeleton active />,
  ssr: false,
});

// 懒加载表单组件
const PostForm = dynamic(() => import('@/components/post/PostForm'), {
  loading: () => <Skeleton active />,
  ssr: false,
});

export default function PostsPage() {
  return (
    <div>
      <PostsTable />
      <PostForm />
    </div>
  );
}
```

### 步骤 2: 实现请求去重和防抖

**文件**: `admin/src/hooks/useDebounce.ts`

```typescript
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**使用示例**:

```typescript
const [searchKeyword, setSearchKeyword] = useState('');
const debouncedKeyword = useDebounce(searchKeyword, 500);

useEffect(() => {
  if (debouncedKeyword) {
    // 执行搜索
    table.setParams({ keyword: debouncedKeyword });
  }
}, [debouncedKeyword]);
```

### 步骤 3: 实现乐观更新

**文件**: `admin/src/hooks/useOptimisticMutation.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

interface OptimisticMutationOptions<TData, TVariables> {
  queryKey: string[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown;
  onError?: (error: unknown, variables: TVariables, context: unknown) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  successMessage?: string;
}

export function useOptimisticMutation<TData, TVariables>({
  queryKey,
  mutationFn,
  onMutate,
  onError,
  onSuccess,
  successMessage,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey });

      // 保存当前数据快照
      const previousData = queryClient.getQueryData(queryKey);

      // 乐观更新
      if (onMutate) {
        const optimisticUpdate = await onMutate(variables);
        queryClient.setQueryData(queryKey, optimisticUpdate);
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // 回滚
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      message.error('操作失败，请稍后重试');
      onError?.(error, variables, context);
    },
    onSuccess: (data, variables) => {
      message.success(successMessage || '操作成功');
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.(data, variables);
    },
  });
}
```

### 步骤 4: 后端查询性能监控

**文件**: `service/src/common/decorators/query-performance.decorator.ts`

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('QueryPerformance');

export function QueryPerformance(threshold: number = 1000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      let result;
      let error;

      try {
        result = await originalMethod.apply(this, args);
      } catch (e) {
        error = e;
        throw e;
      } finally {
        const duration = Date.now() - start;
        
        if (duration > threshold) {
          logger.warn(
            `Slow query detected: ${target.constructor.name}.${propertyKey} took ${duration}ms`,
            {
              duration,
              method: propertyKey,
              class: target.constructor.name,
              args: args.length > 0 ? JSON.stringify(args) : undefined,
            }
          );
        }

        // 记录到监控系统
        if (this.logger) {
          this.logger.debug(`Query performance: ${propertyKey} - ${duration}ms`);
        }
      }

      return result;
    };

    return descriptor;
  };
}
```

**使用示例**:

```typescript
@Injectable()
export class UsersService {
  @QueryPerformance(500) // 超过 500ms 记录警告
  async findAll(queryDto: QueryUserDto) {
    // ...
  }
}
```

### 步骤 5: 缓存标签系统

**文件**: `service/src/common/cache/cache-tags.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CacheTagsService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * 为缓存键添加标签
   */
  async tag(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.redis.sadd(`cache:tag:${tag}`, key);
      await this.redis.set(`cache:key:${key}:tag:${tag}`, '1');
    }
  }

  /**
   * 根据标签失效缓存
   */
  async invalidateByTag(tag: string): Promise<void> {
    const keys = await this.redis.smembers(`cache:tag:${tag}`);
    
    if (keys.length > 0) {
      // 删除所有相关缓存
      await Promise.all(keys.map(key => this.redis.del(key)));
      // 删除标签集合
      await this.redis.del(`cache:tag:${tag}`);
    }
  }

  /**
   * 根据多个标签失效缓存
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    await Promise.all(tags.map(tag => this.invalidateByTag(tag)));
  }

  /**
   * 清理键的所有标签
   */
  async clearTags(key: string): Promise<void> {
    const pattern = `cache:key:${key}:tag:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

**更新 BaseService**:

```typescript
// service/src/common/services/base.service.ts
import { CacheTagsService } from '@/common/cache/cache-tags.service';

export abstract class BaseService<T extends BaseEntity> {
  protected cacheTagsService?: CacheTagsService;

  protected async setCache(key: string, value: T, ttl: number, tags?: string[]) {
    if (this.cacheService) {
      await this.cacheService.set(key, value, ttl);
      if (tags && this.cacheTagsService) {
        await this.cacheTagsService.tag(key, tags);
      }
    }
  }

  async update(id: string, updateDto: Partial<T>): Promise<T> {
    const entity = await this.findById(id, false);
    Object.assign(entity, updateDto);
    const updated = await this.repository.save(entity);

    // 清除缓存
    if (this.cacheService) {
      await this.cacheService.delete(this.getCacheKey(id));
      // 根据实体类型失效相关标签
      await this.cacheTagsService?.invalidateByTag(this.getEntityName().toLowerCase());
    }

    return updated;
  }
}
```

---

## 测试框架搭建

### 步骤 1: 配置 Jest

**文件**: `service/jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
    '!**/main.ts',
    '!**/index.ts',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### 步骤 2: 创建测试工具

**文件**: `service/test/utils/test-helpers.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export async function createTestingModule(providers: any[]) {
  return Test.createTestingModule({
    providers,
  }).compile();
}

export function createMockRepository<T>(): Partial<Repository<T>> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
  };
}
```

### 步骤 3: 编写示例测试

**文件**: `service/src/modules/users/users.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BusinessException } from '@/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const savedUser = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createDto);

      expect(result).toEqual(savedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { username: createDto.username },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error if username already exists', async () => {
      const createDto: CreateUserDto = {
        username: 'existing',
        email: 'test@example.com',
        password: 'password123',
      };

      mockRepository.findOne.mockResolvedValue({ id: '1', username: 'existing' });

      await expect(service.create(createDto)).rejects.toThrow(BusinessException);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: '1', username: 'test', email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw error if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(BusinessException);
    });
  });
});
```

### 步骤 4: 集成测试示例

**文件**: `service/test/users.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 登录获取 token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.username).toBe('testuser');
        });
    });

    it('should return 400 if username already exists', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'admin',
          email: 'admin@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.code).not.toBe(0);
        });
    });
  });

  describe('/users (GET)', () => {
    it('should return paginated users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, pageSize: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('items');
          expect(res.body.data).toHaveProperty('total');
        });
    });
  });
});
```

---

## API 文档生成

### 步骤 1: 配置 Swagger

**文件**: `service/src/main.ts`

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('Fidoo Blog API')
    .setDescription('Fidoo Blog 企业级博客系统 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', '认证相关')
    .addTag('users', '用户管理')
    .addTag('posts', '文章管理')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3005);
}
```

### 步骤 2: 添加 API 装饰器

**文件**: `service/src/modules/users/users.controller.ts`

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: '创建用户', description: '创建一个新用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 409, description: '用户名已存在' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表', description: '分页获取用户列表' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: '每页数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }
}
```

### 步骤 3: 添加 DTO 文档

**文件**: `service/src/modules/users/dto/create-user.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
```

---

## 总结

本文档提供了具体的重构实施步骤和代码示例。建议按照以下顺序实施：

1. **类型系统统一** (1-2 天)
2. **错误处理优化** (2-3 天)
3. **性能优化** (3-5 天)
4. **测试框架** (5-7 天)
5. **API 文档** (1-2 天)

每个步骤完成后，进行代码审查和测试，确保质量。

