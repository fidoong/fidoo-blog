import { Controller, Get, Post, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BusinessException } from '@/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User, UserRole } from '@/modules/users/entities/user.entity';
import { MediaType } from './entities/media.entity';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('media')
@ApiBearerAuth('JWT-auth')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
    if (!file) {
      throw BusinessException.badRequest('请选择文件');
    }

    return this.mediaService.upload(file, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取媒体列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', enum: MediaType, required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: MediaType,
  ) {
    return this.mediaService.findAll(page, limit, type);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取媒体详情' })
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Post(':id/delete')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: '删除媒体文件' })
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
