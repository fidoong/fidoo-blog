import { IsOptional, IsString, IsEnum, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { PermissionType, PermissionStatus } from '../entities/permission.entity';

export class QueryPermissionDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '权限名称（模糊匹配）', example: '创建' })
  @IsOptional()
  @IsString()
  nameLike?: string;

  @ApiPropertyOptional({ description: '权限编码（精确匹配）', example: 'posts:create' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: '权限编码列表（多值查询）',
    example: ['posts:create', 'posts:update'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  codes?: string[];

  @ApiPropertyOptional({ description: '权限类型', enum: PermissionType })
  @IsOptional()
  @IsEnum(PermissionType)
  type?: PermissionType;

  @ApiPropertyOptional({
    description: '权限类型列表（多值查询）',
    example: ['menu', 'button'],
    enum: PermissionType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PermissionType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  types?: PermissionType[];

  @ApiPropertyOptional({ description: '资源标识', example: 'posts' })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional({ description: '操作标识', example: 'create' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'API路径', example: '/api/posts' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: 'HTTP方法', example: 'POST' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: '权限状态', enum: PermissionStatus })
  @IsOptional()
  @IsEnum(PermissionStatus)
  status?: PermissionStatus;

  @ApiPropertyOptional({
    description: '权限状态列表（多值查询）',
    example: ['enabled', 'disabled'],
    enum: PermissionStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PermissionStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  statuses?: PermissionStatus[];

  @ApiPropertyOptional({ description: '父权限ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: '是否只查询根权限（parentId为null）',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  rootOnly?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'sortOrder',
    default: 'sortOrder',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'sortOrder';
}
