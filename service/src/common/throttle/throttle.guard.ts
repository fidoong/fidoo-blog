import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { THROTTLE_METADATA, ThrottleOptions } from './throttle.decorator';

/**
 * 增强的限流守卫
 * 支持装饰器级别的限流配置
 * 注意：此守卫需要配合 @nestjs/throttler 的 ThrottlerModule 使用
 */
@Injectable()
export class EnhancedThrottlerGuard extends ThrottlerGuard implements CanActivate {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    // 支持 IP + User ID 组合追踪
    const user = req.user as { id?: string; userId?: string } | undefined;
    const userId = user?.id || user?.userId;
    const connection = req.connection as { remoteAddress?: string } | undefined;
    const ip = (req.ip as string) || connection?.remoteAddress || 'unknown';
    return userId ? `${ip}:${userId}` : ip;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    const controller = context.getClass();

    // 检查是否有跳过限流的装饰器
    const throttleMetadata = this.reflector.getAllAndOverride<ThrottleOptions | { skip: boolean }>(
      THROTTLE_METADATA,
      [handler, controller],
    );

    if (throttleMetadata && 'skip' in throttleMetadata && throttleMetadata.skip) {
      return true;
    }

    // 如果有自定义限流配置，可以在这里实现自定义逻辑
    // 注意：由于 ThrottlerGuard 的复杂性，建议使用装饰器配置全局限流
    // 自定义限流可以通过中间件或拦截器实现

    return super.canActivate(context);
  }
}
