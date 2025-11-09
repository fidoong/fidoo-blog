import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';

@ApiTags('menus')
@ApiBearerAuth('JWT-auth')
@Controller('menus')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @Permissions('menus:create')
  @ApiOperation({ summary: '创建菜单' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @Permissions('menus:view')
  @ApiOperation({ summary: '获取菜单列表' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get('tree')
  @Permissions('menus:view')
  @ApiOperation({ summary: '获取菜单树' })
  findTree() {
    return this.menusService.findTree();
  }

  @Get(':id')
  @Permissions('menus:view')
  @ApiOperation({ summary: '获取菜单详情' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Put(':id')
  @Permissions('menus:update')
  @ApiOperation({ summary: '更新菜单' })
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @Permissions('menus:delete')
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }
}

