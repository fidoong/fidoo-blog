import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  MaxLength,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { DictionaryType, DictionaryStatus } from '../entities/dictionary.entity';

export class CreateDictionaryDto {
  @ApiProperty({ description: '字典名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '字典编码（唯一标识）' })
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: '字典类型', enum: DictionaryType, default: DictionaryType.DICT })
  @IsEnum(DictionaryType)
  @IsOptional()
  type?: DictionaryType;

  @ApiProperty({ description: '父字典ID（用于树形结构）', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '显示标签', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @ApiProperty({ description: '字典值', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  value?: string;

  @ApiProperty({ description: '扩展字段（JSON格式）', required: false })
  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: '状态', enum: DictionaryStatus, default: DictionaryStatus.ENABLED })
  @IsEnum(DictionaryStatus)
  @IsOptional()
  status?: DictionaryStatus;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否系统字典', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}

