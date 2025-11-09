import {
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  IsUUID,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';

/**
 * 增强的基础查询DTO
 * 包含所有通用的查询条件，各模块可以继承并扩展
 */
export class BaseQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '搜索关键词（通用搜索，会搜索名称、标题、描述等字段）',
    example: '关键词',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

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
    description: '排序字段',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
