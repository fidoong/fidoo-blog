import { SetMetadata, ExecutionContext } from '@nestjs/common';

export const THROTTLE_METADATA = 'throttle';

export interface ThrottleOptions {
  /** 时间窗口（秒） */
  ttl?: number;
  /** 限制次数 */
  limit?: number;
  /** 是否跳过限流 */
  skipIf?: (context: ExecutionContext) => boolean;
}

/**
 * 限流装饰器
 * @param options 限流配置
 */
export const Throttle = (options?: ThrottleOptions) =>
  SetMetadata(THROTTLE_METADATA, options || {});

/**
 * 跳过限流装饰器
 */
export const SkipThrottle = () => SetMetadata(THROTTLE_METADATA, { skip: true });
