import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA, CACHE_SKIP_METADATA } from './cache.decorator';

/**
 * 缓存拦截器
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const handler = context.getHandler();

    // 检查是否跳过缓存
    const skipCache = this.reflector.getAllAndOverride<boolean>(CACHE_SKIP_METADATA, [handler]);
    if (skipCache) {
      return next.handle();
    }

    // 获取缓存键和 TTL
    const cacheKey = this.getCacheKey(context);
    const ttl = this.reflector.getAllAndOverride<number>(CACHE_TTL_METADATA, [handler]);

    if (!cacheKey) {
      return next.handle();
    }

    // 尝试从缓存获取
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    // 执行请求并缓存结果
    return next.handle().pipe(
      tap(async (data) => {
        if (ttl) {
          await this.cacheManager.set(cacheKey, data, ttl * 1000);
        } else {
          await this.cacheManager.set(cacheKey, data);
        }
      }),
    );
  }

  private getCacheKey(context: ExecutionContext): string | undefined {
    const handler = context.getHandler();
    const request = context.switchToHttp().getRequest();

    // 从装饰器获取缓存键
    const cacheKey = this.reflector.getAllAndOverride<string>(CACHE_KEY_METADATA, [handler]);

    if (cacheKey) {
      return cacheKey;
    }

    // 默认使用请求路径和方法作为缓存键
    const { method, url, user } = request;
    const userId = user?.id || 'anonymous';
    return `${method}:${url}:${userId}`;
  }
}
