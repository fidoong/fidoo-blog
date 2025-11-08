import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { Favorite } from './entities/favorite.entity';
import { PostsModule } from '@/modules/posts/posts.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite]), PostsModule, NotificationsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
