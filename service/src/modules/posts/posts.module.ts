import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { TagsModule } from '@/modules/tags/tags.module';
import { PostRepository } from './repositories/post.repository';
import { PostDomainService } from './domain/post.domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), CategoriesModule, TagsModule],
  controllers: [PostsController],
  providers: [PostsService, PostRepository, PostDomainService],
  exports: [PostsService, PostRepository],
})
export class PostsModule {}
