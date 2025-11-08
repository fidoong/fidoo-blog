import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { Like } from './entities/like.entity';
import { PostsModule } from '@/modules/posts/posts.module';
import { CommentsModule } from '@/modules/comments/comments.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), PostsModule, CommentsModule, NotificationsModule],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
