import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: '创建标签' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '获取所有标签' })
  findAll() {
    return this.tagsService.findAllSorted();
  }

  @Public()
  @Get('category/:categoryId')
  @ApiOperation({ summary: '根据分类 ID 获取标签' })
  findByCategoryId(@Param('categoryId') categoryId: string) {
    return this.tagsService.findByCategoryId(categoryId);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: '通过 slug 获取标签详情' })
  findBySlug(@Param('slug') slug: string) {
    return this.tagsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取标签详情' })
  findOne(@Param('id') id: string) {
    return this.tagsService.findById(id);
  }

  @Post(':id/update')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: '更新标签' })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Post(':id/delete')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除标签' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
