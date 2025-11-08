import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * 获取请求追踪 ID 的装饰器
 */
export const TraceId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest() as Request & { traceId?: string };
  return request.traceId || '';
});
