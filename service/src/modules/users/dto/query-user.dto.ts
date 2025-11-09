import { IsOptional, IsString, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { UserRoleEnum, UserStatus } from '../entities/user.entity';

export class QueryUserDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: '用户名（模糊匹配）', example: 'user' })
  @IsOptional()
  @IsString()
  usernameLike?: string;

  @ApiPropertyOptional({ description: '邮箱（模糊匹配）', example: 'example' })
  @IsOptional()
  @IsString()
  emailLike?: string;

  @ApiPropertyOptional({ description: '昵称（模糊匹配）', example: '昵称' })
  @IsOptional()
  @IsString()
  nicknameLike?: string;

  @ApiPropertyOptional({ description: '用户角色', enum: UserRoleEnum })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;

  @ApiPropertyOptional({
    description: '用户角色列表（多值查询）',
    example: ['admin', 'editor'],
    enum: UserRoleEnum,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserRoleEnum, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  roles?: UserRoleEnum[];

  @ApiPropertyOptional({ description: '用户状态', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: '用户状态列表（多值查询）',
    example: ['active', 'inactive'],
    enum: UserStatus,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value.split(',')))
  statuses?: UserStatus[];

  @ApiPropertyOptional({
    description: '是否包含用户资料',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeProfile?: boolean;

  @ApiPropertyOptional({
    description: '是否包含角色信息',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeRoles?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';
}
