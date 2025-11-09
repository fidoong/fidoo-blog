import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';

@ApiTags('permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('permissions:create')
  @ApiOperation({ summary: '创建权限' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Permissions('permissions:view')
  @ApiOperation({ summary: '获取权限列表（支持增强查询条件，带分页）' })
  findAll(@Query() queryDto: QueryPermissionDto) {
    // 如果没有分页参数，返回所有权限（向后兼容）
    if (!queryDto.page && !queryDto.pageSize && !queryDto.limit) {
      return this.permissionsService.findAll();
    }
    return this.permissionsService.findAllEnhanced(queryDto);
  }

  @Get(':id')
  @Permissions('permissions:view')
  @ApiOperation({ summary: '获取权限详情' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Put(':id')
  @Permissions('permissions:update')
  @ApiOperation({ summary: '更新权限' })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions('permissions:delete')
  @ApiOperation({ summary: '删除权限' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
