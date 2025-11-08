import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { Follow } from './entities/follow.entity';
import { UsersModule } from '@/modules/users/users.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow]), UsersModule, NotificationsModule],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
