import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('roles:create')
  @ApiOperation({ summary: '创建角色' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Permissions('roles:view')
  @ApiOperation({ summary: '获取角色列表（支持增强查询条件，带分页）' })
  findAll(@Query() queryDto: QueryRoleDto) {
    // 如果没有分页参数，返回所有角色（向后兼容）
    if (!queryDto.page && !queryDto.pageSize && !queryDto.limit) {
      return this.rolesService.findAll();
    }
    return this.rolesService.findAllEnhanced(queryDto);
  }

  @Get(':id')
  @Permissions('roles:view')
  @ApiOperation({ summary: '获取角色详情' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @Permissions('roles:update')
  @ApiOperation({ summary: '更新角色' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions('roles:delete')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
