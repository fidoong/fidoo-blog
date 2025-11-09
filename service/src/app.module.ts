import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { redisStore } from 'cache-manager-redis-yet';

// 配置
import appConfig from '@/config/app.config';
import databaseConfig from '@/config/database.config';
import redisConfig from '@/config/redis.config';
import jwtConfig from '@/config/jwt.config';
import oauthConfig from '@/config/oauth.config';

// 公共模块
import { LoggerModule } from '@/common/logger/logger.module';
import { DatabaseModule } from '@/database/database.module';
import { CacheModule as CommonCacheModule } from '@/common/cache';
import { AppI18nModule } from '@/i18n/i18n.module';

// 业务模块
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { PostsModule } from '@/modules/posts/posts.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { TagsModule } from '@/modules/tags/tags.module';
import { CommentsModule } from '@/modules/comments/comments.module';
import { MediaModule } from '@/modules/media/media.module';
import { SystemModule } from '@/modules/system/system.module';
import { FollowsModule } from '@/modules/follows/follows.module';
import { LikesModule } from '@/modules/likes/likes.module';
import { FavoritesModule } from '@/modules/favorites/favorites.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { UserProfilesModule } from '@/modules/user-profiles/user-profiles.module';
import { MenusModule } from '@/modules/menus/menus.module';
import { PermissionsModule } from '@/modules/permissions/permissions.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { UserRolesModule } from '@/modules/user-roles/user-roles.module';
import { DictionariesModule } from '@/modules/dictionaries/dictionaries.module';
import { AuditLogsModule } from '@/modules/audit-logs/audit-logs.module';
import { WebSocketModule } from '@/modules/websocket/websocket.module';

// 健康检查
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 过滤器
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, oauthConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    DatabaseModule,

    // 缓存模块 - Redis
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        try {
          const redisHost = configService.get('redis.host', 'localhost');
          const redisPort = configService.get('redis.port', 6379);
          const redisPassword = configService.get('redis.password', '');
          const redisDb = configService.get('redis.db', 0);

          console.log(`正在连接 Redis: ${redisHost}:${redisPort}`);

          const store = await redisStore({
            socket: {
              host: redisHost,
              port: redisPort,
            },
            password: redisPassword || undefined,
            database: redisDb,
            ttl: 60 * 1000, // 默认 60 秒
          });

          console.log('Redis 连接成功');
          return { store };
        } catch (error) {
          console.error('Redis 连接失败:', error);
          console.error('提示: 请确保 Redis 服务已启动');
          console.error('  - 检查 Redis 是否运行: redis-cli ping');
          console.error('  - 启动 Redis: redis-server (或使用 Docker)');
          throw error;
        }
      },
      inject: [ConfigService],
    }),

    // 限流模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL', 60) * 1000,
          limit: configService.get('THROTTLE_LIMIT', 100),
        },
      ],
      inject: [ConfigService],
    }),

    // 队列模块
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 事件模块
    EventEmitterModule.forRoot(),

    // 日志模块
    LoggerModule,

    // 国际化模块
    AppI18nModule,

    // 公共缓存模块
    CommonCacheModule,

    // 业务模块
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
    MediaModule,
    SystemModule,
    FollowsModule,
    LikesModule,
    FavoritesModule,
    NotificationsModule,
    UserProfilesModule,
    MenusModule,
    PermissionsModule,
    RolesModule,
    UserRolesModule,
    DictionariesModule,
    AuditLogsModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局异常过滤器（支持依赖注入）
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
