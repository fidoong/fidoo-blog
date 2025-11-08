import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: '创建分类' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '获取所有分类' })
  findAll() {
    return this.categoriesService.findAllSorted();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Post(':id/update')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: '更新分类' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Post(':id/delete')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '删除分类' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
