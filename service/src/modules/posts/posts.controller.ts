import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRoleEnum, User } from '@/modules/users/entities/user.entity';
import { PostStatus } from './entities/post.entity';
import { QueryDto } from '@/common/dto';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建文章' })
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(createPostDto, user.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '获取文章列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量（兼容参数）' })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'authorId', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  findAll(@Query() queryDto: QueryDto) {
    return this.postsService.findAll(queryDto);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: '通过 slug 获取文章' })
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取文章详情' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Post(':id/update')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.EDITOR)
  @ApiOperation({ summary: '更新文章' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Post(':id/delete')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.EDITOR)
  @ApiOperation({ summary: '删除文章' })
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: '增加浏览量' })
  incrementViewCount(@Param('id') id: string) {
    return this.postsService.incrementViewCount(id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({ summary: '点赞文章' })
  incrementLikeCount(@Param('id') id: string) {
    return this.postsService.incrementLikeCount(id);
  }
}
