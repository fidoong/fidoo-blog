import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DictionariesService } from './dictionaries.service';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { QueryDictionaryDto, GetOptionsDto } from './dto/query-dictionary.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { Public } from '@/common/decorators/public.decorator';
import { DictionaryType } from './entities/dictionary.entity';

@ApiTags('dictionaries')
@ApiBearerAuth('JWT-auth')
@Controller('dictionaries')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class DictionariesController {
  constructor(private readonly dictionariesService: DictionariesService) {}

  @Post()
  @Permissions('dictionaries:create')
  @ApiOperation({ summary: '创建字典' })
  create(@Body() createDictionaryDto: CreateDictionaryDto) {
    return this.dictionariesService.create(createDictionaryDto);
  }

  @Get()
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '获取字典列表（支持分页、搜索、过滤）' })
  findAll(@Query() queryDto: QueryDictionaryDto) {
    return this.dictionariesService.findAll(queryDto);
  }

  @Get('all')
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '获取所有字典列表（扁平，不分页）' })
  findAllFlat() {
    return this.dictionariesService.findAllFlat();
  }

  @Get('tree')
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '获取树形结构的字典列表' })
  @ApiQuery({ name: 'code', required: false, description: '字典编码（可选）' })
  findTree(@Query('code') code?: string) {
    return this.dictionariesService.findTree(code);
  }

  @Get('options')
  @Public()
  @ApiOperation({ summary: '获取选项列表（用于下拉单选/多选）' })
  async getOptions(@Query() queryDto: GetOptionsDto) {
    if (queryDto.format === 'tree') {
      return this.dictionariesService.getTreeOptions(queryDto);
    }
    return this.dictionariesService.getOptions(queryDto);
  }

  @Get('dict')
  @Public()
  @ApiOperation({ summary: '获取字典数据（支持tree和dict格式，支持JSON）' })
  @ApiQuery({ name: 'code', required: true, description: '字典编码' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['tree', 'dict'],
    description: '返回格式：tree（树形）或dict（字典）',
  })
  async getDictionary(
    @Query('code') code: string,
    @Query('format') format: 'tree' | 'dict' = 'dict',
  ) {
    const data = await this.dictionariesService.findByCode(code, format);
    return {
      success: true,
      data,
      code,
      format,
    };
  }

  @Get('grouped')
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '获取所有字典（按编码分组）' })
  @ApiQuery({ name: 'type', required: false, enum: DictionaryType, description: '字典类型' })
  findAllByType(@Query('type') type?: DictionaryType) {
    return this.dictionariesService.findAllByType(type);
  }

  @Get('stats/count')
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '统计字典数量（按条件分组）' })
  countByConditions(@Query() queryDto: QueryDictionaryDto) {
    return this.dictionariesService.countByConditions(queryDto);
  }

  @Get('exists/check')
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '检查字典是否存在（根据code和value）' })
  @ApiQuery({ name: 'code', required: true, description: '字典编码' })
  @ApiQuery({ name: 'value', required: false, description: '字典值' })
  async existsByCodeAndValue(@Query('code') code: string, @Query('value') value?: string) {
    const exists = await this.dictionariesService.existsByCodeAndValue(code, value || null);
    return { exists };
  }

  @Get(':id')
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '获取字典详情' })
  findOne(@Param('id') id: string) {
    return this.dictionariesService.findOne(id);
  }

  @Put(':id')
  @Permissions('dictionaries:update')
  @ApiOperation({ summary: '更新字典' })
  update(@Param('id') id: string, @Body() updateDictionaryDto: UpdateDictionaryDto) {
    return this.dictionariesService.update(id, updateDictionaryDto);
  }

  @Delete(':id')
  @Permissions('dictionaries:delete')
  @ApiOperation({ summary: '删除字典' })
  remove(@Param('id') id: string) {
    return this.dictionariesService.remove(id);
  }

  @Post('batch-delete')
  @Permissions('dictionaries:delete')
  @ApiOperation({ summary: '批量删除字典' })
  removeMany(@Body() body: { ids: string[] }) {
    return this.dictionariesService.removeMany(body.ids);
  }

  @Post('batch-get')
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '批量查询字典（根据ID列表）' })
  findByIds(@Body() body: { ids: string[]; includeRelations?: boolean }) {
    return this.dictionariesService.findByIds(body.ids, body.includeRelations || false);
  }

  @Get(':id/path')
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '获取字典的完整路径（从根节点到当前节点）' })
  getPath(@Param('id') id: string) {
    return this.dictionariesService.getPath(id);
  }

  @Get(':id/children')
  @Permissions('dictionaries:view')
  @ApiOperation({ summary: '获取字典的所有子节点（扁平列表）' })
  getAllChildren(@Param('id') id: string) {
    return this.dictionariesService.getAllChildren(id);
  }
}
