import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppBootstrapConfig } from './config/app-bootstrap.config';
import { LoggerService } from '@/common/logger/logger.service';

async function bootstrap() {
  try {
    // 在应用创建时直接配置 CORS
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ];

    console.log('正在创建 NestJS 应用...');
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    // 配置 CORS
    app.enableCors({
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
    });

    console.log('应用创建成功，正在配置...');
    // 配置应用
    await AppBootstrapConfig.configure(app);

    // 启动应用
    const port = AppBootstrapConfig.getPort();
    const logger = app.get(LoggerService);
    await app.listen(port);
    logger.log(`服务器已启动，监听端口: ${port}`);
    logger.log(`CORS 已启用，允许的源: ${JSON.stringify(allowedOrigins)}`);
  } catch (error) {
    console.error('应用启动失败:');
    console.error(error);
    
    // 提供更详细的错误信息
    if (error instanceof Error) {
      console.error('\n错误详情:');
      console.error('消息:', error.message);
      console.error('堆栈:', error.stack);
      
      // 常见错误提示
      const errorMessage = error.message.toLowerCase();
      const errorStack = error.stack?.toLowerCase() || '';
      
      if (errorMessage.includes('econnrefused') || errorMessage.includes('connect') || errorStack.includes('econnrefused')) {
        console.error('\n⚠️  连接错误提示:');
        
        // 检查是否是 Redis 连接错误
        if (errorMessage.includes('redis') || errorMessage.includes('6379') || 
            errorStack.includes('redis') || errorStack.includes('6379')) {
          console.error('  ❌ Redis 服务未启动或连接失败');
          console.error('  📍 检查步骤:');
          console.error('     1. 检查 Redis 是否运行: redis-cli ping');
          console.error('     2. 如果未运行，启动 Redis:');
          console.error('        - macOS: brew services start redis');
          console.error('        - Linux: sudo systemctl start redis');
          console.error('        - Docker: docker run -d -p 6379:6379 --name redis redis');
          console.error('     3. 检查端口是否被占用: lsof -i :6379');
        } 
        // 检查是否是 PostgreSQL 连接错误
        else if (errorMessage.includes('postgres') || errorMessage.includes('5432') || 
                 errorStack.includes('postgres') || errorStack.includes('5432')) {
          console.error('  ❌ PostgreSQL 数据库未启动或连接失败');
          console.error('  📍 检查步骤:');
          console.error('     1. 检查 PostgreSQL 是否运行: pg_isready');
          console.error('     2. 如果未运行，启动 PostgreSQL:');
          console.error('        - macOS: brew services start postgresql');
          console.error('        - Linux: sudo systemctl start postgresql');
          console.error('        - Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres');
          console.error('     3. 检查端口是否被占用: lsof -i :5432');
        } 
        // 通用连接错误
        else {
          console.error('  ❌ 服务连接失败 (ECONNREFUSED)');
          console.error('  📍 可能的原因:');
          console.error('     - Redis 未启动 (端口 6379)');
          console.error('     - PostgreSQL 未启动 (端口 5432)');
          console.error('  💡 快速启动所有服务:');
          console.error('     docker-compose up -d');
        }
      }
      
      if (error.message.includes('JWT') || error.message.includes('secret')) {
        console.error('\n⚠️  JWT 配置错误:');
        console.error('  - 请检查 .env 文件中的 JWT_SECRET 配置');
        console.error('  - 确保 JWT_SECRET 不为空且长度足够');
      }
    }
    
    process.exit(1);
  }
}

bootstrap();
