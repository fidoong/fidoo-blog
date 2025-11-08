import { IsOptional, IsString, IsIn, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { PostStatus } from '@/modules/posts/entities/post.entity';

export class SortDto {
  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class QueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '搜索关键词',
    example: '关键词',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: '开始日期',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: '结束日期',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: '分类 ID',
    example: 'uuid',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: '作者 ID',
    example: 'uuid',
  })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    description: '文章状态',
    example: 'published',
    enum: PostStatus,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
