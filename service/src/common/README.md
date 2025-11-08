# Common 模块文档

本文档介绍了 service 下 common 模块中所有可用的企业级公共模块。

## 目录

- [限流模块 (Throttle)](#限流模块-throttle)
- [追踪模块 (Tracing)](#追踪模块-tracing)
- [审计模块 (Audit)](#审计模块-audit)
- [加密/脱敏模块 (Encryption)](#加密脱敏模块-encryption)
- [版本控制模块 (Versioning)](#版本控制模块-versioning)
- [重试模块 (Retry)](#重试模块-retry)
- [分布式锁模块 (Lock)](#分布式锁模块-lock)
- [批量处理模块 (Batch)](#批量处理模块-batch)
- [健康检查模块 (Health)](#健康检查模块-health)
- [数据转换模块 (Transformers)](#数据转换模块-transformers)
- [验证器 (Validators)](#验证器-validators)

## 限流模块 (Throttle)

提供请求限流功能，防止接口被恶意请求。

### 使用示例

```typescript
import { Controller, Get } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@/common';

@Controller('api')
export class ApiController {
  // 使用自定义限流配置
  @Get('limited')
  @Throttle({ ttl: 60, limit: 10 }) // 60秒内最多10次请求
  getLimited() {
    return { message: 'This endpoint is rate limited' };
  }

  // 跳过限流
  @Get('unlimited')
  @SkipThrottle()
  getUnlimited() {
    return { message: 'This endpoint is not rate limited' };
  }
}
```

## 追踪模块 (Tracing)

为每个请求生成唯一的追踪 ID，便于日志追踪和问题排查。

### 使用示例

```typescript
import { Controller, Get } from '@nestjs/common';
import { TraceId, TracingMiddleware } from '@/common';

@Controller('api')
export class ApiController {
  // 在控制器中使用追踪 ID
  @Get('test')
  test(@TraceId() traceId: string) {
    return { traceId };
  }
}

// 在 main.ts 中注册中间件
app.use(TracingMiddleware);
```

## 审计模块 (Audit)

记录用户操作日志，用于审计和问题排查。

### 使用示例

```typescript
import { Controller, Post } from '@nestjs/common';
import { Audit, SkipAudit } from '@/common';

@Controller('users')
export class UsersController {
  // 记录审计日志
  @Post()
  @Audit({
    action: 'create_user',
    resource: 'user',
    logParams: true,
    logResponse: false,
    sensitiveFields: ['password'],
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    // ...
  }

  // 跳过审计
  @Get('public')
  @SkipAudit()
  getPublicData() {
    // ...
  }
}
```

## 加密/脱敏模块 (Encryption)

提供数据加密、解密和脱敏功能。

### 使用示例

```typescript
import { EncryptionService } from '@/common';

@Injectable()
export class UserService {
  constructor(private encryptionService: EncryptionService) {}

  // 加密数据
  encryptData(data: string) {
    return this.encryptionService.encrypt(data, 'secret-key');
  }

  // 解密数据
  decryptData(encryptedData: string) {
    return this.encryptionService.decrypt(encryptedData, 'secret-key');
  }

  // 数据脱敏
  maskPhone(phone: string) {
    return this.encryptionService.maskPhone(phone); // 138****1234
  }

  maskEmail(email: string) {
    return this.encryptionService.maskEmail(email); // u***r@example.com
  }
}
```

## 版本控制模块 (Versioning)

提供 API 版本管理功能。

### 使用示例

```typescript
import { Controller, Get } from '@nestjs/common';
import { Version } from '@/common';

@Controller('api')
export class ApiController {
  // 指定 API 版本
  @Get('users')
  @Version('1')
  getUsersV1() {
    return { version: 'v1', users: [] };
  }

  @Get('users')
  @Version('2')
  getUsersV2() {
    return { version: 'v2', users: [] };
  }

  // 支持多个版本
  @Get('posts')
  @Version(['1', '2'])
  getPosts() {
    return { posts: [] };
  }
}
```

## 重试模块 (Retry)

提供自动重试失败操作的功能。

### 使用示例

```typescript
import { Controller, Get } from '@nestjs/common';
import { Retry } from '@/common';

@Controller('api')
export class ApiController {
  // 配置重试
  @Get('external-api')
  @Retry({
    maxAttempts: 3,
    delay: 1000,
    backoff: 2, // 指数退避
    retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT'],
  })
  async callExternalApi() {
    // 如果失败，会自动重试
    return await this.externalService.fetch();
  }
}
```

## 分布式锁模块 (Lock)

提供分布式锁功能，防止并发操作导致的数据不一致。

### 使用示例

```typescript
import { Controller, Post } from '@nestjs/common';
import { Lock } from '@/common';

@Controller('orders')
export class OrdersController {
  // 使用分布式锁
  @Post('create')
  @Lock({
    key: (args) => `order:${args[0].userId}`, // 动态生成锁键
    ttl: 30000, // 30秒
    timeout: 5000, // 等待5秒
  })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    // 同一用户的订单创建操作会被串行化
    return await this.orderService.create(createOrderDto);
  }
}
```

## 批量处理模块 (Batch)

提供批量操作的工具方法。

### 使用示例

```typescript
import { BatchService } from '@/common';

@Injectable()
export class UserService {
  constructor(private batchService: BatchService) {}

  // 批量处理数据
  async processUsers(users: User[]) {
    return await this.batchService.batchProcess(
      users,
      async (user) => {
        // 处理单个用户
        return await this.processUser(user);
      },
      10, // 每批10个
      3, // 并发3批
    );
  }

  // 批量插入
  async batchInsertUsers(users: User[]) {
    return await this.batchService.batchInsert(
      users,
      async (batch) => {
        await this.userRepository.insert(batch);
      },
      100, // 每批100个
    );
  }
}
```

## 健康检查模块 (Health)

提供系统健康状态检查功能。

### 使用示例

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthService } from '@/common';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  async checkHealth() {
    return await this.healthService.checkHealth();
  }

  @Get('readiness')
  async checkReadiness() {
    const isReady = await this.healthService.checkReadiness();
    return { ready: isReady };
  }

  @Get('liveness')
  async checkLiveness() {
    const isAlive = await this.healthService.checkLiveness();
    return { alive: isAlive };
  }
}
```

## 数据转换模块 (Transformers)

提供数据转换、序列化、反序列化等功能。

### 使用示例

```typescript
import { TransformService } from '@/common';

@Injectable()
export class UserService {
  constructor(private transformService: TransformService) {}

  // 将普通对象转换为类实例
  transformToUserDto(plain: any) {
    return this.transformService.plainToClass(UserDto, plain);
  }

  // 转换分页数据
  transformPaginatedUsers(users: User[], total: number, page: number, pageSize: number) {
    return this.transformService.transformPaginated(users, total, page, pageSize, (user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }

  // 选择字段
  pickUserFields(user: User) {
    return this.transformService.pickFields(user, ['id', 'name', 'email']);
  }
}
```

## 验证器 (Validators)

提供额外的数据验证装饰器。

### 使用示例

```typescript
import { IsUuid, IsEmail, IsUrl, IsDateString } from '@/common';

export class CreateUserDto {
  @IsUuid()
  id: string;

  @IsEmail()
  email: string;

  @IsUrl()
  website?: string;

  @IsDateString()
  birthDate: string;
}
```

## 模块集成

在 `app.module.ts` 中导入需要的模块：

```typescript
import { Module } from '@nestjs/common';
import { AuditModule, LockModule, BatchModule, HealthModule, TransformModule } from '@/common';

@Module({
  imports: [
    AuditModule,
    LockModule,
    BatchModule,
    HealthModule,
    TransformModule,
    // ... 其他模块
  ],
})
export class AppModule {}
```

## 最佳实践

1. **限流**: 对公开接口使用限流，防止恶意请求
2. **追踪**: 在生产环境中启用追踪中间件，便于问题排查
3. **审计**: 对敏感操作（如删除、修改）启用审计日志
4. **加密**: 对敏感数据进行加密存储
5. **脱敏**: 在返回响应时自动脱敏敏感信息
6. **版本控制**: 为 API 提供版本管理，便于向后兼容
7. **重试**: 对网络请求等可能失败的操作使用重试机制
8. **分布式锁**: 对并发敏感的操作使用分布式锁
9. **批量处理**: 对大量数据的操作使用批量处理，提高性能
10. **健康检查**: 提供健康检查接口，便于监控和运维

## 注意事项

- 某些模块（如 Lock、Throttle）需要 Redis 支持
- 审计日志建议存储到数据库或日志系统
- 加密密钥应该妥善保管，不要硬编码
- 分布式锁的 TTL 应该根据实际业务场景设置
- 批量处理的批次大小和并发数需要根据实际情况调整
