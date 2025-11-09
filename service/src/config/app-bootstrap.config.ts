import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { LoggerService } from '@/common/logger/logger.service';

/**
 * 应用启动配置
 */
export class AppBootstrapConfig {
  /**
   * 配置应用
   */
  static async configure(app: INestApplication): Promise<void> {
    const configService = app.get(ConfigService);
    const logger = app.get(LoggerService);

    // 设置全局前缀
    const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
    app.setGlobalPrefix(apiPrefix);

    // 启用 API 版本控制
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // CORS 已在 main.ts 中配置，这里不再重复配置
    // this.configureCors(app, configService);

    // 使用自定义日志服务
    app.useLogger(logger);

    // 全局验证管道
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // 全局异常过滤器已在 app.module.ts 中通过 APP_FILTER 提供者注册
    // 这里不再需要手动注册

    // 全局响应拦截器
    app.useGlobalInterceptors(new TransformInterceptor());

    // 配置 Swagger 文档
    this.configureSwagger(app, apiPrefix);

    // 优雅关闭
    app.enableShutdownHooks();

    // 注意：这里只是配置完成，实际启动在 main.ts 中
    logger.log(`应用配置完成，准备启动端口: ${this.getPort()}`);
    logger.log(`API 文档地址: http://localhost:${this.getPort()}/${apiPrefix}/docs`);
    logger.log(`环境: ${configService.get('NODE_ENV')}`);
  }

  /**
   * 配置 CORS
   */
  private static configureCors(app: INestApplication, configService: ConfigService): void {
    const corsOriginsEnv = configService.get<string>('CORS_ORIGINS', '').split(',').filter(Boolean);
    const defaultOrigins = [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
    ];
    const allowedOrigins = corsOriginsEnv.length > 0 ? corsOriginsEnv : defaultOrigins;

    const logger = app.get(LoggerService);
    logger.log(`CORS 配置: 允许的源 ${JSON.stringify(allowedOrigins)}`);

    // 使用回调函数形式确保正确处理 origin
    app.enableCors({
      origin: (origin, callback) => {
        // 允许没有 origin 的请求（如移动应用、Postman 等）
        if (!origin) {
          return callback(null, true);
        }

        // 检查 origin 是否在允许列表中
        if (allowedOrigins.includes(origin)) {
          logger.log(`CORS: 允许来自 ${origin} 的请求`);
          return callback(null, true);
        }

        logger.warn(`CORS: 拒绝来自 ${origin} 的请求`);
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
      exposedHeaders: ['Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    logger.log('CORS 已启用');
  }

  /**
   * 配置 Swagger 文档
   */
  private static configureSwagger(app: INestApplication, apiPrefix: string): void {
    const config = new DocumentBuilder()
      .setTitle('Fidoo Blog API')
      .setDescription('企业级博客系统 RESTful API 文档')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: '输入 JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', '认证授权')
      .addTag('users', '用户管理')
      .addTag('posts', '文章管理')
      .addTag('categories', '分类管理')
      .addTag('tags', '标签管理')
      .addTag('comments', '评论管理')
      .addTag('media', '媒体管理')
      .addTag('system', '系统管理')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  /**
   * 获取应用端口
   */
  static getPort(): number {
    // 后端服务固定使用 3005 端口（避免与前端和其他服务冲突）
    return 3005;
  }
}
