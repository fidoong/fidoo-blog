import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { Post } from '@/modules/posts/entities/post.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Comment } from '@/modules/comments/entities/comment.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, Comment, Category, Tag]),
  ],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
