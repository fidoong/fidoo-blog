import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppBootstrapConfig } from './config/app-bootstrap.config';
import { LoggerService } from '@/common/logger/logger.service';

async function bootstrap() {
  // 在应用创建时直接配置 CORS
  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
  ];

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: {
      origin: (origin, callback) => {
        // 允许没有 origin 的请求（如移动应用、Postman 等）
        if (!origin) {
          return callback(null, true);
        }
        // 检查 origin 是否在允许列表中
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
      exposedHeaders: ['Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  });

  // 配置应用
  await AppBootstrapConfig.configure(app);

  // 启动应用
  const port = AppBootstrapConfig.getPort();
  const logger = app.get(LoggerService);
  await app.listen(port);
  logger.log(`服务器已启动，监听端口: ${port}`);
  logger.log(`CORS 已启用，允许的源: ${JSON.stringify(allowedOrigins)}`);
}

bootstrap();
