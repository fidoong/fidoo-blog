import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { LOCK_METADATA, LockOptions } from './lock.decorator';
import { LockService } from './lock.service';

/**
 * 分布式锁拦截器
 * 自动为方法添加分布式锁
 */
@Injectable()
export class LockInterceptor implements NestInterceptor {
  private readonly logger = new Logger('LockInterceptor');

  constructor(
    private reflector: Reflector,
    private lockService: LockService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const handler = context.getHandler();
    const controller = context.getClass();

    // 获取锁配置
    const lockOptions = this.reflector.getAllAndOverride<LockOptions>(LOCK_METADATA, [
      handler,
      controller,
    ]);

    // 如果跳过锁，直接执行
    if (lockOptions?.skip) {
      return next.handle();
    }

    // 如果没有配置锁，直接执行
    if (!lockOptions) {
      return next.handle();
    }

    // 生成锁的键
    const args = context.getArgs();
    const lockKey =
      typeof lockOptions.key === 'function'
        ? lockOptions.key(args)
        : lockOptions.key || `${controller.name}:${handler.name}`;

    const ttl = lockOptions.ttl || 30000;
    const timeout = lockOptions.timeout || 5000;
    const interval = lockOptions.interval || 100;

    // 尝试获取锁
    const acquired = await this.lockService.tryLock(lockKey, ttl, timeout, interval);

    if (!acquired) {
      this.logger.warn(`Failed to acquire lock: ${lockKey}`);
      return throwError(() => new Error('Resource is locked, please try again later'));
    }

    // 执行操作，完成后释放锁
    return next.handle().pipe(
      tap({
        next: () => {
          this.lockService.release(lockKey).catch((error) => {
            this.logger.error(`Failed to release lock ${lockKey}: ${error.message}`);
          });
        },
        error: () => {
          this.lockService.release(lockKey).catch((error) => {
            this.logger.error(`Failed to release lock ${lockKey}: ${error.message}`);
          });
        },
      }),
      catchError((error) => {
        this.lockService.release(lockKey).catch((releaseError) => {
          this.logger.error(`Failed to release lock ${lockKey}: ${releaseError.message}`);
        });
        return throwError(() => error);
      }),
    );
  }
}
