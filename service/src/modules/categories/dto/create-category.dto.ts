import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: '分类名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: '分类描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '排序顺序', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: '是否激活', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
