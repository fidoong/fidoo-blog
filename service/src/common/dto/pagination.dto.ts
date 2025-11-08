import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: '每页数量（兼容 limit 参数）',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  get skip(): number {
    const size = this.pageSize || this.limit || 10;
    return ((this.page || 1) - 1) * size;
  }

  get take(): number {
    return this.pageSize || this.limit || 10;
  }
}

export class PaginationResponseDto<T> {
  @ApiPropertyOptional({ description: '数据列表' })
  items: T[];

  @ApiPropertyOptional({ description: '总数量' })
  total: number;

  @ApiPropertyOptional({ description: '当前页码' })
  page: number;

  @ApiPropertyOptional({ description: '每页数量' })
  pageSize: number;

  @ApiPropertyOptional({ description: '总页数' })
  totalPages: number;

  @ApiPropertyOptional({ description: '是否有上一页' })
  hasPrevious: boolean;

  @ApiPropertyOptional({ description: '是否有下一页' })
  hasNext: boolean;

  constructor(items: T[], total: number, page: number, pageSize: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / (pageSize || 10));
    this.hasPrevious = page > 1;
    this.hasNext = page < this.totalPages;
  }
}
