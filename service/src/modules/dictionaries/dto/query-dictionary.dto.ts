import { IsOptional, IsString, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { DictionaryType, DictionaryStatus } from '../entities/dictionary.entity';

export class QueryDictionaryDto extends PaginationDto {
  @ApiPropertyOptional({ description: '搜索关键词（名称、编码、标签）', example: '用户' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '字典编码', example: 'user_status' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: '字典类型', enum: DictionaryType })
  @IsOptional()
  @IsEnum(DictionaryType)
  type?: DictionaryType;

  @ApiPropertyOptional({ description: '状态', enum: DictionaryStatus })
  @IsOptional()
  @IsEnum(DictionaryStatus)
  status?: DictionaryStatus;

  @ApiPropertyOptional({ description: '父字典ID', example: 'uuid' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: '是否系统字典', example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({ description: '排序字段', example: 'sortOrder' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'sortOrder';

  @ApiPropertyOptional({ description: '排序方向', enum: ['ASC', 'DESC'], example: 'ASC' })
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

