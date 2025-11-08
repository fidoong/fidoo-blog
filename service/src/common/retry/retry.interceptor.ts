import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap, take } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RETRY_METADATA, RetryOptions } from './retry.decorator';

/**
 * 重试拦截器
 * 自动重试失败的操作
 */
@Injectable()
export class RetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RetryInterceptor');

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const controller = context.getClass();

    // 获取重试配置
    const retryOptions = this.reflector.getAllAndOverride<RetryOptions>(RETRY_METADATA, [
      handler,
      controller,
    ]);

    // 如果没有配置重试，直接执行
    if (!retryOptions) {
      return next.handle();
    }

    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 2,
      retryableErrors = [],
      retryCondition,
    } = retryOptions;

    return next.handle().pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error, index) => {
            const attempt = index + 1;

            // 检查是否应该重试
            if (!this.shouldRetry(error, retryableErrors, retryCondition)) {
              this.logger.error(`Retry failed: ${error.message}. Not retryable.`);
              return throwError(() => error);
            }

            // 检查是否超过最大重试次数
            if (attempt >= maxAttempts) {
              this.logger.error(`Retry failed after ${maxAttempts} attempts: ${error.message}`);
              return throwError(() => error);
            }

            // 计算延迟时间（指数退避）
            const retryDelay = delay * Math.pow(backoff, index);

            this.logger.warn(
              `Retry attempt ${attempt}/${maxAttempts} after ${retryDelay}ms: ${error.message}`,
            );

            // 延迟后重试
            return timer(retryDelay);
          }),
          take(maxAttempts),
        ),
      ),
    );
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(
    error: any,
    retryableErrors: (string | ErrorConstructor)[],
    retryCondition?: (error: any) => boolean,
  ): boolean {
    // 如果有自定义重试条件，使用它
    if (retryCondition) {
      return retryCondition(error);
    }

    // 检查错误类型
    if (retryableErrors.length > 0) {
      return retryableErrors.some((errorType) => {
        if (typeof errorType === 'string') {
          return error.constructor.name === errorType || error.name === errorType;
        }
        return error instanceof errorType;
      });
    }

    // 默认重试网络错误和超时错误
    const networkErrors = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN'];

    return (
      networkErrors.includes(error.code) ||
      error.status >= 500 ||
      error.message?.includes('timeout')
    );
  }
}
