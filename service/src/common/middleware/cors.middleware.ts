import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * CORS 中间件（简单版本，生产环境建议使用 @nestjs/platform-express 的 cors 配置）
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;

    // 允许的源（可以从配置中读取）
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

    if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  }
}
