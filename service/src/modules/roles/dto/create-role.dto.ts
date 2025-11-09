import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, MaxLength } from 'class-validator';
import { RoleStatus } from '../entities/role.entity';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '角色编码（唯一）' })
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: '状态', enum: RoleStatus, default: RoleStatus.ENABLED })
  @IsEnum(RoleStatus)
  @IsOptional()
  status?: RoleStatus;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: '权限ID列表', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];

  @ApiProperty({ description: '菜单ID列表', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  menuIds?: string[];
}
