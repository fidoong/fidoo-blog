import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRoleEnum } from './entities/user.entity';
import { QueryDto } from '@/common/dto';
import { QueryUserDto } from './dto/query-user.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '创建用户 (仅管理员)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.EDITOR)
  @ApiOperation({ summary: '获取用户列表（支持增强查询条件）' })
  findAll(@Query() queryDto: QueryUserDto | QueryDto) {
    return this.usersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post(':id/update')
  @ApiOperation({ summary: '更新用户信息' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(':id/delete')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '删除用户 (仅管理员)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
