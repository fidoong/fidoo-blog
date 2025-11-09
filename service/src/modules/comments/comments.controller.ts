import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Ip,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User, UserRoleEnum } from '@/modules/users/entities/user.entity';
import { CommentStatus } from './entities/comment.entity';
import { QueryCommentDto } from './dto/query-comment.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '创建评论' })
  create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user: User, @Ip() ip: string) {
    return this.commentsService.create(createCommentDto, user.id, ip);
  }

  @Public()
  @Get('post/:postId')
  @ApiOperation({ summary: '获取文章的评论' })
  @ApiQuery({ name: 'status', enum: CommentStatus, required: false })
  findByPost(@Param('postId') postId: string, @Query('status') status?: CommentStatus) {
    return this.commentsService.findByPost(postId, status);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.EDITOR)
  @ApiOperation({ summary: '获取评论列表（支持增强查询条件）' })
  findAll(@Query() queryDto: QueryCommentDto) {
    // 向后兼容：如果没有使用新的查询参数，使用旧的方法
    if (!queryDto.page && !queryDto.pageSize && !queryDto.limit && !queryDto.keyword) {
      const page = queryDto.page || 1;
      const limit = queryDto.pageSize || queryDto.limit || 10;
      const status = queryDto.status;
      return this.commentsService.findAll(page, limit, status);
    }
    return this.commentsService.findAllEnhanced(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取评论详情' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Post(':id/update')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '更新评论' })
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Post(':id/delete')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '删除评论' })
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.EDITOR)
  @ApiOperation({ summary: '通过评论' })
  approve(@Param('id') id: string) {
    return this.commentsService.approve(id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.EDITOR)
  @ApiOperation({ summary: '拒绝评论' })
  reject(@Param('id') id: string) {
    return this.commentsService.reject(id);
  }
}
