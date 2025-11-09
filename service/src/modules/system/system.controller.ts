import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRoleEnum } from '@/modules/users/entities/user.entity';

@ApiTags('system')
@ApiBearerAuth('JWT-auth')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('info')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '获取系统信息（仅管理员）' })
  getSystemInfo() {
    return this.systemService.getSystemInfo();
  }

  @Get('process')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '获取进程信息（仅管理员）' })
  getProcessInfo() {
    return this.systemService.getProcessInfo();
  }

  @Get('dashboard')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '获取仪表盘统计数据（仅管理员）' })
  getDashboardStats() {
    return this.systemService.getDashboardStats();
  }
}
