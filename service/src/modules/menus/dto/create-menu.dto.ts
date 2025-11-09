import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';
import { MenuType, MenuStatus } from '../entities/menu.entity';

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '显示标题', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ description: '路由路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @ApiProperty({ description: '组件路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  component?: string;

  @ApiProperty({ description: '图标', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  icon?: string;

  @ApiProperty({ description: '菜单编码（唯一标识）', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @ApiProperty({ description: '菜单类型', enum: MenuType, default: MenuType.MENU })
  @IsEnum(MenuType)
  @IsOptional()
  type?: MenuType;

  @ApiProperty({ description: '父菜单ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: '状态', enum: MenuStatus, default: MenuStatus.ENABLED })
  @IsEnum(MenuStatus)
  @IsOptional()
  status?: MenuStatus;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否隐藏', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({ description: '是否缓存', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isCache?: boolean;

  @ApiProperty({ description: '是否外链', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isExternal?: boolean;

  @ApiProperty({ description: '外链地址', required: false })
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @ApiProperty({ description: '关联的权限编码', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  permissionCode?: string;
}
