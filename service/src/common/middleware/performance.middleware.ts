import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 性能监控中间件
 */
@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Performance');
  private readonly slowRequestThreshold = 1000; // 1秒

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      // 记录慢请求
      if (duration > this.slowRequestThreshold) {
        this.logger.warn(`慢请求: ${method} ${originalUrl} - ${duration}ms - ${statusCode}`);
      }

      // 记录性能指标
      this.logger.debug(`性能指标: ${method} ${originalUrl} - ${duration}ms - ${statusCode}`);
    });

    next();
  }
}
