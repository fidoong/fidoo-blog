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
  @ApiOperation({ summary: '获取所有分类（扁平列表）' })
  findAll() {
    return this.categoriesService.findAllSorted();
  }

  @Public()
  @Get('tree')
  @ApiOperation({ summary: '获取分类树形结构（大类及其子分类）' })
  findTree() {
    return this.categoriesService.findTree();
  }

  @Public()
  @Get('tree/stats')
  @ApiOperation({ summary: '获取分类树形结构及统计信息' })
  async findTreeWithStats() {
    return this.categoriesService.getCategoriesWithStats();
  }

  @Public()
  @Get(':id/stats')
  @ApiOperation({ summary: '获取分类统计信息' })
  async getStats(@Param('id') id: string) {
    return this.categoriesService.getCategoryStats(id);
  }

  @Public()
  @Get('main')
  @ApiOperation({ summary: '获取所有大类（level = 0）' })
  findMainCategories() {
    return this.categoriesService.findMainCategories();
  }

  @Public()
  @Get('parent/:parentId')
  @ApiOperation({ summary: '根据父分类 ID 获取子分类' })
  findByParentId(@Param('parentId') parentId: string) {
    return this.categoriesService.findByParentId(parentId);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: '通过 slug 获取分类详情' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
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
