import { SetMetadata } from '@nestjs/common';

export const LOCK_METADATA = 'lock';

export interface LockOptions {
  /** 锁的键（支持函数动态生成） */
  key?: string | ((args: unknown[]) => string);
  /** 锁的过期时间（毫秒） */
  ttl?: number;
  /** 等待超时时间（毫秒） */
  timeout?: number;
  /** 重试间隔（毫秒） */
  interval?: number;
  /** 是否跳过锁 */
  skip?: boolean;
}

/**
 * 分布式锁装饰器
 * @param options 锁配置
 */
export const Lock = (options?: LockOptions) => SetMetadata(LOCK_METADATA, options || {});

/**
 * 跳过锁装饰器
 */
export const SkipLock = () => SetMetadata(LOCK_METADATA, { skip: true });
