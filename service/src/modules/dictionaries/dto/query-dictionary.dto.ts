import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  IsDateString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { DictionaryType, DictionaryStatus } from '../entities/dictionary.entity';

export class QueryDictionaryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词（名称、编码、标签、描述）', example: '用户' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '字典编码（精确匹配）', example: 'user_status' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: '字典编码列表（多值查询）',
    example: ['user_status', 'order_status'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  codes?: string[];

  @ApiPropertyOptional({ description: '字典类型', enum: DictionaryType })
  @IsOptional()
  @IsEnum(DictionaryType)
  type?: DictionaryType;

  @ApiPropertyOptional({
    description: '字典类型列表（多值查询）',
    example: ['tree', 'dict'],
    enum: DictionaryType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DictionaryType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  types?: DictionaryType[];

  @ApiPropertyOptional({ description: '状态', enum: DictionaryStatus })
  @IsOptional()
  @IsEnum(DictionaryStatus)
  status?: DictionaryStatus;

  @ApiPropertyOptional({
    description: '状态列表（多值查询）',
    example: ['enabled', 'disabled'],
    enum: DictionaryStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DictionaryStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  statuses?: DictionaryStatus[];

  @ApiPropertyOptional({ description: '父字典ID（精确匹配）', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: '父字典ID列表（多值查询）',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  parentIds?: string[];

  @ApiPropertyOptional({
    description: '是否只查询根节点（parentId为null）',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  rootOnly?: boolean;

  @ApiPropertyOptional({
    description: '是否包含子节点（树形结构查询）',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeChildren?: boolean;

  @ApiPropertyOptional({
    description: '最大深度（树形结构层级，0表示不限制）',
    example: 3,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDepth?: number;

  @ApiPropertyOptional({
    description: '最小深度（树形结构层级）',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minDepth?: number;

  @ApiPropertyOptional({ description: '字典值（精确匹配）', example: 'active' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ description: '字典值（模糊匹配）', example: 'act' })
  @IsOptional()
  @IsString()
  valueLike?: string;

  @ApiPropertyOptional({
    description: '字典值列表（多值查询）',
    example: ['active', 'inactive'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  values?: string[];

  @ApiPropertyOptional({ description: '显示标签（精确匹配）', example: '激活' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: '显示标签（模糊匹配）', example: '激活' })
  @IsOptional()
  @IsString()
  labelLike?: string;

  @ApiPropertyOptional({ description: '描述（模糊匹配）', example: '用户状态' })
  @IsOptional()
  @IsString()
  descriptionLike?: string;

  @ApiPropertyOptional({
    description: '扩展字段的键名（用于JSON查询）',
    example: 'color',
  })
  @IsOptional()
  @IsString()
  extraKey?: string;

  @ApiPropertyOptional({
    description: '扩展字段的值（用于JSON查询，与extraKey配合使用）',
    example: 'red',
  })
  @IsOptional()
  @IsString()
  extraValue?: string;

  @ApiPropertyOptional({
    description: '扩展字段的JSON路径查询（PostgreSQL JSONB路径）',
    example: '$.color',
  })
  @IsOptional()
  @IsString()
  extraPath?: string;

  @ApiPropertyOptional({ description: '是否系统字典', example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({
    description: 'ID列表（多值查询）',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  ids?: string[];

  @ApiPropertyOptional({
    description: '创建时间起始（ISO 8601格式）',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiPropertyOptional({
    description: '创建时间结束（ISO 8601格式）',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.createdAtFrom !== undefined)
  createdAtTo?: string;

  @ApiPropertyOptional({
    description: '更新时间起始（ISO 8601格式）',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  updatedAtFrom?: string;

  @ApiPropertyOptional({
    description: '更新时间结束（ISO 8601格式）',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.updatedAtFrom !== undefined)
  updatedAtTo?: string;

  @ApiPropertyOptional({
    description: '是否包含已删除的记录',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: '是否包含父节点信息',
    example: true,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeParent?: boolean;

  @ApiPropertyOptional({
    description: '是否包含子节点信息（关联查询）',
    example: true,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeChildrenRelation?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'sortOrder',
    default: 'sortOrder',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'sortOrder';

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
    default: 'ASC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class GetOptionsDto {
  @ApiPropertyOptional({ description: '字典编码', example: 'user_status' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '父字典ID（用于树形结构）', example: 'uuid' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: '是否只返回启用的', example: true, default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enabledOnly?: boolean = true;

  @ApiPropertyOptional({ description: '返回格式', enum: ['options', 'tree'], example: 'options' })
  @IsOptional()
  @IsString()
  format?: 'options' | 'tree' = 'options';

  @ApiPropertyOptional({ description: '标签字段名', example: 'label', default: 'label' })
  @IsOptional()
  @IsString()
  labelField?: string = 'label';

  @ApiPropertyOptional({ description: '值字段名', example: 'value', default: 'value' })
  @IsOptional()
  @IsString()
  valueField?: string = 'value';
}
