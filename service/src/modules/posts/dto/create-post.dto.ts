import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostStatus } from '../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({ description: '文章标题' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'URL slug' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug: string;

  @ApiProperty({ description: '文章摘要', required: false })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ description: '文章内容' })
  @IsString()
  content: string;

  @ApiProperty({ description: '封面图片', required: false })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: '文章状态', enum: PostStatus })
  @IsEnum(PostStatus)
  status: PostStatus;

  @ApiProperty({ description: '分类 ID', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: '标签 IDs', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiProperty({ description: '是否精选', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: '是否置顶', required: false })
  @IsOptional()
  @IsBoolean()
  isTop?: boolean;
}
