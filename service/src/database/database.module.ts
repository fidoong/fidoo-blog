import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '@/modules/users/entities/user.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { Comment } from '@/modules/comments/entities/comment.entity';
import { Media } from '@/modules/media/entities/media.entity';
import { Follow } from '@/modules/follows/entities/follow.entity';
import { Like } from '@/modules/likes/entities/like.entity';
import { Favorite } from '@/modules/favorites/entities/favorite.entity';
import { Notification } from '@/modules/notifications/entities/notification.entity';
import { UserProfile } from '@/modules/user-profiles/entities/user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          User,
          Post,
          Category,
          Tag,
          Comment,
          Media,
          Follow,
          Like,
          Favorite,
          Notification,
          UserProfile,
        ],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        // 连接池配置
        extra: {
          max: 100, // 最大连接数
          min: 10, // 最小连接数
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
