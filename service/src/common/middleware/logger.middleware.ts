import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 请求日志中间件
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // 记录请求开始
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // 监听响应结束
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length');

      const message = `${method} ${originalUrl} ${statusCode} ${duration}ms - ${contentLength || 0} - ${ip}`;

      if (statusCode >= 400) {
        this.logger.error(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
