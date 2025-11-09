import { IsOptional, IsString, IsEnum, IsBoolean, IsArray, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { RoleStatus } from '../entities/role.entity';

export class QueryRoleDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '角色名称（模糊匹配）', example: '管理员' })
  @IsOptional()
  @IsString()
  nameLike?: string;

  @ApiPropertyOptional({ description: '角色编码（精确匹配）', example: 'admin' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: '角色编码列表（多值查询）',
    example: ['admin', 'editor'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  codes?: string[];

  @ApiPropertyOptional({ description: '角色状态', enum: RoleStatus })
  @IsOptional()
  @IsEnum(RoleStatus)
  status?: RoleStatus;

  @ApiPropertyOptional({
    description: '角色状态列表（多值查询）',
    example: ['enabled', 'disabled'],
    enum: RoleStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(RoleStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  statuses?: RoleStatus[];

  @ApiPropertyOptional({ description: '是否系统角色', example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({
    description: '最小排序值',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minSortOrder?: number;

  @ApiPropertyOptional({
    description: '最大排序值',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxSortOrder?: number;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'sortOrder',
    default: 'sortOrder',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'sortOrder';
}
