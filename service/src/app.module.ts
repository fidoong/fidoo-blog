import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

// 公共模块
import { LoggerModule } from '@/common/logger/logger.module';
import { DatabaseModule } from '@/database/database.module';
import { CacheModule as CommonCacheModule } from '@/common/cache';

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

// 健康检查
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    DatabaseModule,

    // 缓存模块 - Redis
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('redis.host'),
            port: configService.get('redis.port'),
          },
          password: configService.get('redis.password'),
          database: configService.get('redis.db'),
          ttl: 60 * 1000, // 默认 60 秒
        }),
      }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
