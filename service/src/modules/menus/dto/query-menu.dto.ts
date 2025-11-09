import { IsOptional, IsString, IsEnum, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { MenuType, MenuStatus } from '../entities/menu.entity';

export class QueryMenuDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '菜单名称（模糊匹配）', example: '用户' })
  @IsOptional()
  @IsString()
  nameLike?: string;

  @ApiPropertyOptional({ description: '菜单标题（模糊匹配）', example: '用户管理' })
  @IsOptional()
  @IsString()
  titleLike?: string;

  @ApiPropertyOptional({ description: '菜单编码（精确匹配）', example: 'user:manage' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: '菜单编码列表（多值查询）',
    example: ['user:manage', 'post:manage'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  codes?: string[];

  @ApiPropertyOptional({ description: '菜单类型', enum: MenuType })
  @IsOptional()
  @IsEnum(MenuType)
  type?: MenuType;

  @ApiPropertyOptional({
    description: '菜单类型列表（多值查询）',
    example: ['menu', 'button'],
    enum: MenuType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MenuType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  types?: MenuType[];

  @ApiPropertyOptional({ description: '菜单状态', enum: MenuStatus })
  @IsOptional()
  @IsEnum(MenuStatus)
  status?: MenuStatus;

  @ApiPropertyOptional({
    description: '菜单状态列表（多值查询）',
    example: ['enabled', 'disabled'],
    enum: MenuStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MenuStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  statuses?: MenuStatus[];

  @ApiPropertyOptional({ description: '父菜单ID', example: 'uuid' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({
    description: '是否只查询根菜单（parentId为null）',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  rootOnly?: boolean;

  @ApiPropertyOptional({ description: '是否隐藏', example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({ description: '是否缓存', example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isCache?: boolean;

  @ApiPropertyOptional({ description: '是否外链', example: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isExternal?: boolean;

  @ApiPropertyOptional({ description: '权限编码', example: 'user:view' })
  @IsOptional()
  @IsString()
  permissionCode?: string;

  @ApiPropertyOptional({
    description: '是否包含子菜单',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeChildren?: boolean;

  @ApiPropertyOptional({
    description: '是否包含父菜单',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeParent?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'sortOrder',
    default: 'sortOrder',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'sortOrder';
}
