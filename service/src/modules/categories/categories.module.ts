import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { Post } from '@/modules/posts/entities/post.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Post, Tag])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
