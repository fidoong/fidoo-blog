import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  healthCheck() {
    return this.appService.getHealth();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '获取 API 信息' })
  getInfo() {
    return this.appService.getInfo();
  }
}
