/**
 * 菜单响应 DTO
 * 用于规范返回给前端的菜单数据格式
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuType, MenuStatus } from '../entities/menu.entity';

export class MenuResponseDto {
  @ApiProperty({ description: '菜单 ID' })
  id: string;

  @ApiProperty({ description: '菜单名称' })
  name: string;

  @ApiProperty({ description: '显示标题' })
  title: string;

  @ApiPropertyOptional({ description: '路由路径' })
  path?: string;

  @ApiPropertyOptional({ description: '组件路径' })
  component?: string;

  @ApiPropertyOptional({ description: '图标名称' })
  icon?: string;

  @ApiPropertyOptional({ description: '菜单编码' })
  code?: string;

  @ApiProperty({ description: '菜单类型', enum: MenuType })
  type: MenuType;

  @ApiPropertyOptional({ description: '父菜单 ID' })
  parentId?: string;

  @ApiProperty({ description: '排序', default: 0 })
  sortOrder: number;

  @ApiProperty({ description: '状态', enum: MenuStatus })
  status: MenuStatus;

  @ApiProperty({ description: '是否隐藏', default: false })
  isHidden: boolean;

  @ApiPropertyOptional({ description: '关联的权限编码' })
  permission?: string;

  @ApiPropertyOptional({ description: '子菜单列表', type: [MenuResponseDto] })
  children?: MenuResponseDto[];

  @ApiPropertyOptional({ description: '创建时间' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: '更新时间' })
  updatedAt?: Date;
}
