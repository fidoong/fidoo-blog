import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, Matches } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: '标签名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: '标签颜色 (十六进制)', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: '颜色必须是有效的十六进制格式' })
  color?: string;
}
