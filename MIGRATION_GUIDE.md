# 迁移指南

## 从旧代码迁移到新架构

### 前端迁移

#### 1. API 客户端迁移

**旧代码：**

```typescript
import { postsApi } from '@/lib/api-client';
```

**新代码：**

```typescript
import { postsApi } from '@/shared/api';
```

#### 2. 状态管理迁移

**旧代码：**

```typescript
import { useAuthStore } from '@/store/auth';
```

**新代码：**

```typescript
import { useAuthStore } from '@/shared/store';
```

#### 3. 类型定义迁移

**旧代码：**

```typescript
import { User, Post } from '@/types';
```

**新代码：**

```typescript
import { User, Post } from '@fidoo-blog/shared';
```

#### 5. 使用配置

**新功能：**

```typescript
import { apiConfig, appConfig } from '@/shared/config';

console.log(apiConfig.baseURL);
console.log(appConfig.name);
```

### 后端迁移

#### 1. 使用 Repository 模式

**旧代码：**

```typescript
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAll() {
    return this.postsRepository.find();
  }
}
```

**新代码：**

```typescript
@Injectable()
export class PostsService {
  constructor(
    private postRepository: PostRepository,
    private postDomainService: PostDomainService,
  ) {}

  async findAll(queryDto: QueryDto) {
    const [posts, total] = await this.postRepository.findPublished(queryDto);
    return new PaginationResponseDto(posts, total, queryDto.page || 1, 10);
  }
}
```

#### 2. 使用领域服务

**新代码：**

```typescript
// 创建实体
const post = this.postDomainService.createPost(createPostDto, authorId);

// 验证
this.postDomainService.canPublish(post);

// 更新实体
this.postDomainService.updatePost(post, updatePostDto);
```

#### 3. 使用事件系统（可选，NestJS EventEmitter）

**新功能：**

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';
import { POST_EVENTS } from '@/shared/events';

constructor(private eventEmitter: EventEmitter2) {}

async create(createPostDto: CreatePostDto) {
  const post = await this.postRepository.save(post);
  // 可选：发送领域事件
  this.eventEmitter.emit(POST_EVENTS.CREATED, post);
  return post;
}
```

## 步骤

1. **更新依赖**

   ```bash
   pnpm install
   ```

2. **构建共享包**

   ```bash
   pnpm shared:build
   ```

3. **更新导入路径**
   - 将 `@/lib/api-client` 改为 `@/shared/api`
   - 将 `@/store/auth` 改为 `@/shared/store`
   - 将 `@/types` 改为 `@fidoo-blog/shared`

4. **更新组件**
   - 使用新的 API 客户端
   - 使用新的状态管理

5. **测试**
   - 运行单元测试
   - 运行集成测试
   - 手动测试主要功能

## 注意事项

1. **类型兼容性**：确保所有类型定义都已迁移到共享包
2. **API 兼容性**：确保 API 接口保持一致
3. **状态兼容性**：确保状态管理的数据结构兼容
4. **配置兼容性**：确保环境变量配置正确

## 回滚计划

如果遇到问题，可以：

1. 恢复旧的导入路径
2. 使用旧的 API 客户端
3. 使用旧的状态管理

所有旧代码仍然保留在项目中，可以逐步迁移。
