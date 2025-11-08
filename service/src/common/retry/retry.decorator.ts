import { SetMetadata } from '@nestjs/common';

export const RETRY_METADATA = 'retry';

export interface RetryOptions {
  /** 重试次数 */
  maxAttempts?: number;
  /** 重试延迟（毫秒） */
  delay?: number;
  /** 延迟增长因子（指数退避） */
  backoff?: number;
  /** 需要重试的错误类型 */
  retryableErrors?: (string | ErrorConstructor)[];
  /** 自定义重试条件 */
  retryCondition?: (error: any) => boolean;
}

/**
 * 重试装饰器
 * @param options 重试配置
 */
export const Retry = (options?: RetryOptions) => SetMetadata(RETRY_METADATA, options || {});
