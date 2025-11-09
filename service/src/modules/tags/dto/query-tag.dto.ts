import { IsOptional, IsString, IsArray, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@/common/dto/base-query.dto';

export class QueryTagDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '标签名称（模糊匹配）', example: '前端' })
  @IsOptional()
  @IsString()
  nameLike?: string;

  @ApiPropertyOptional({ description: '标签slug（精确匹配）', example: 'frontend' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: '分类ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: '分类ID列表（多值查询）',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  categoryIds?: string[];

  @ApiPropertyOptional({ description: '标签颜色', example: '#ff0000' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: '是否包含分类信息',
    example: false,
    default: false,
  })
  @IsOptional()
  includeCategory?: boolean;

  @ApiPropertyOptional({
    description: '是否包含文章统计',
    example: false,
    default: false,
  })
  @IsOptional()
  includePostCount?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'name',
    default: 'name',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';
}
