import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { PostStatus } from '../entities/post.entity';

export class QueryPostDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '文章标题（模糊匹配）', example: '标题' })
  @IsOptional()
  @IsString()
  titleLike?: string;

  @ApiPropertyOptional({ description: '文章slug（精确匹配）', example: 'post-slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: '文章状态', enum: PostStatus })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({
    description: '文章状态列表（多值查询）',
    example: ['published', 'draft'],
    enum: PostStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PostStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  statuses?: PostStatus[];

  @ApiPropertyOptional({ description: '作者ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({
    description: '作者ID列表（多值查询）',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  authorIds?: string[];

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

  @ApiPropertyOptional({ description: '标签ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  tagId?: string;

  @ApiPropertyOptional({
    description: '标签ID列表（多值查询）',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  tagIds?: string[];

  @ApiPropertyOptional({ description: '是否精选', example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: '是否置顶', example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isTop?: boolean;

  @ApiPropertyOptional({
    description: '最小浏览量',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minViewCount?: number;

  @ApiPropertyOptional({
    description: '最大浏览量',
    example: 10000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxViewCount?: number;

  @ApiPropertyOptional({
    description: '最小点赞数',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minLikeCount?: number;

  @ApiPropertyOptional({
    description: '最大点赞数',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxLikeCount?: number;

  @ApiPropertyOptional({
    description: '发布时间起始（ISO 8601格式）',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  publishedAtFrom?: string;

  @ApiPropertyOptional({
    description: '发布时间结束（ISO 8601格式）',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  publishedAtTo?: string;

  @ApiPropertyOptional({
    description: '是否包含作者信息',
    example: true,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeAuthor?: boolean;

  @ApiPropertyOptional({
    description: '是否包含分类信息',
    example: true,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeCategory?: boolean;

  @ApiPropertyOptional({
    description: '是否包含标签信息',
    example: true,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeTags?: boolean;

  @ApiPropertyOptional({
    description: '是否包含评论信息',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeComments?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'publishedAt',
    default: 'publishedAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'publishedAt';
}
