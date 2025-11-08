import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 请求追踪中间件
 * 为每个请求生成唯一的追踪 ID，便于日志追踪和问题排查
 */
@Injectable()
export class TracingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 从请求头获取追踪 ID，如果没有则生成新的
    const traceId =
      (req.headers['x-trace-id'] as string) || (req.headers['x-request-id'] as string) || uuidv4();

    // 将追踪 ID 添加到请求对象和响应头
    (req as Request & { traceId: string }).traceId = traceId;
    res.setHeader('X-Trace-Id', traceId);
    res.setHeader('X-Request-Id', traceId);

    next();
  }
}
