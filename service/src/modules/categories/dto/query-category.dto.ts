import { IsOptional, IsString, IsBoolean, IsInt, Min, IsArray, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@/common/dto/base-query.dto';

export class QueryCategoryDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '分类名称（模糊匹配）', example: '技术' })
  @IsOptional()
  @IsString()
  nameLike?: string;

  @ApiPropertyOptional({ description: '分类slug（精确匹配）', example: 'tech' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: '父分类ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: '父分类ID列表（多值查询）',
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
    description: '分类层级（0: 大类, 1: 子分类）',
    example: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  level?: number;

  @ApiPropertyOptional({
    description: '分类层级列表（多值查询）',
    example: [0, 1],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',').map(Number)))
  levels?: number[];

  @ApiPropertyOptional({ description: '是否激活', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '最小排序值',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minSortOrder?: number;

  @ApiPropertyOptional({
    description: '最大排序值',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxSortOrder?: number;

  @ApiPropertyOptional({
    description: '是否包含子分类',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeChildren?: boolean;

  @ApiPropertyOptional({
    description: '是否包含父分类',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeParent?: boolean;

  @ApiPropertyOptional({
    description: '是否包含文章统计',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includePostCount?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'sortOrder',
    default: 'sortOrder',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'sortOrder';
}
