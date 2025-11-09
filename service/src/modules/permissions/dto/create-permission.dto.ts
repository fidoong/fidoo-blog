import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { PermissionType, PermissionStatus } from '../entities/permission.entity';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '权限编码（唯一）' })
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiProperty({ description: '权限类型', enum: PermissionType })
  @IsEnum(PermissionType)
  type: PermissionType;

  @ApiProperty({ description: '资源标识', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  resource?: string;

  @ApiProperty({ description: '操作标识', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  action?: string;

  @ApiProperty({ description: 'API路径', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;

  @ApiProperty({ description: 'HTTP方法', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  method?: string;

  @ApiProperty({ description: '状态', enum: PermissionStatus, default: PermissionStatus.ENABLED })
  @IsEnum(PermissionStatus)
  @IsOptional()
  status?: PermissionStatus;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '父权限ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsOptional()
  sortOrder?: number;
}
