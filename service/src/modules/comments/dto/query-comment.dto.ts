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
import { CommentStatus } from '../entities/comment.entity';

export class QueryCommentDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '评论内容（模糊匹配）', example: '评论' })
  @IsOptional()
  @IsString()
  contentLike?: string;

  @ApiPropertyOptional({ description: '评论状态', enum: CommentStatus })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @ApiPropertyOptional({
    description: '评论状态列表（多值查询）',
    example: ['approved', 'pending'],
    enum: CommentStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CommentStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  statuses?: CommentStatus[];

  @ApiPropertyOptional({ description: '用户ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: '用户ID列表（多值查询）',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  userIds?: string[];

  @ApiPropertyOptional({ description: '文章ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  postId?: string;

  @ApiPropertyOptional({
    description: '文章ID列表（多值查询）',
    example: ['uuid1', 'uuid2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  postIds?: string[];

  @ApiPropertyOptional({ description: '父评论ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: '是否只查询根评论（parentId为null）',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  rootOnly?: boolean;

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
    description: '是否包含用户信息',
    example: true,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeUser?: boolean;

  @ApiPropertyOptional({
    description: '是否包含文章信息',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includePost?: boolean;

  @ApiPropertyOptional({
    description: '是否包含子评论',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeChildren?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';
}
