/**
 * 审计日志控制器
 * 提供审计日志的查询和管理接口
 */

import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User, UserRoleEnum } from '@/modules/users/entities/user.entity';
import { AuditLogsService, QueryAuditLogsDto } from './audit-logs.service';
import { AuditAction, AuditStatus, AuditSeverity } from './entities/audit-log.entity';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '查询审计日志' })
  @ApiQuery({ name: 'userId', required: false, description: '用户 ID' })
  @ApiQuery({ name: 'username', required: false, description: '用户名' })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction, description: '操作类型' })
  @ApiQuery({ name: 'resource', required: false, description: '资源类型' })
  @ApiQuery({ name: 'resourceId', required: false, description: '资源 ID' })
  @ApiQuery({ name: 'ip', required: false, description: 'IP 地址' })
  @ApiQuery({ name: 'status', required: false, enum: AuditStatus, description: '状态' })
  @ApiQuery({ name: 'severity', required: false, enum: AuditSeverity, description: '严重程度' })
  @ApiQuery({ name: 'isAnomaly', required: false, type: Boolean, description: '是否异常' })
  @ApiQuery({ name: 'startTime', required: false, type: Date, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, type: Date, description: '结束时间' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: '偏移量' })
  async findLogs(
    @Query('userId') userId?: string,
    @Query('username') username?: string,
    @Query('action') action?: AuditAction,
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
    @Query('ip') ip?: string,
    @Query('status') status?: AuditStatus,
    @Query('severity') severity?: AuditSeverity,
    @Query('isAnomaly') isAnomaly?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const dto: QueryAuditLogsDto = {
      userId,
      username,
      action: action as AuditAction,
      resource,
      resourceId,
      ip,
      status: status as AuditStatus,
      severity: severity as AuditSeverity,
      isAnomaly: isAnomaly === 'true' ? true : isAnomaly === 'false' ? false : undefined,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };

    return await this.auditLogsService.findLogs(dto);
  }

  @Get('anomalies')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '查询异常日志' })
  @ApiQuery({ name: 'userId', required: false, description: '用户 ID' })
  @ApiQuery({ name: 'startTime', required: false, type: Date, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, type: Date, description: '结束时间' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  async findAnomalies(
    @Query('userId') userId?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('limit') limit?: string,
  ) {
    const dto: Omit<QueryAuditLogsDto, 'isAnomaly'> = {
      userId,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return await this.auditLogsService.findAnomalies(dto);
  }

  @Get('user/:userId')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.EDITOR)
  @ApiOperation({ summary: '查询用户的操作历史' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '数量限制' })
  async findUserLogs(@Param('userId') userId: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.auditLogsService.findUserLogs(userId, limitNum);
  }

  @Get('ip/:ip')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '查询 IP 的操作历史' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '数量限制' })
  async findIpLogs(@Param('ip') ip: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.auditLogsService.findIpLogs(ip, limitNum);
  }

  @Get('trace/:traceId')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '根据追踪 ID 查询日志' })
  async findByTraceId(@Param('traceId') traceId: string) {
    return await this.auditLogsService.findByTraceId(traceId);
  }

  @Get('stats/action/:action')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '统计操作数量' })
  @ApiQuery({ name: 'startTime', required: false, type: Date, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, type: Date, description: '结束时间' })
  async countByAction(
    @Param('action') action: AuditAction,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const count = await this.auditLogsService.countByAction(
      action,
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined,
    );
    return { action, count };
  }

  @Get('stats/anomalies')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '统计异常操作数量' })
  @ApiQuery({ name: 'startTime', required: false, type: Date, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: false, type: Date, description: '结束时间' })
  async countAnomalies(@Query('startTime') startTime?: string, @Query('endTime') endTime?: string) {
    const count = await this.auditLogsService.countAnomalies(
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined,
    );
    return { count };
  }

  @Post('clean')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: '清理过期日志' })
  @ApiQuery({
    name: 'daysToKeep',
    required: false,
    type: Number,
    description: '保留天数（默认90天）',
  })
  async cleanOldLogs(@Query('daysToKeep') daysToKeep?: string) {
    const days = daysToKeep ? parseInt(daysToKeep, 10) : 90;
    const deleted = await this.auditLogsService.cleanOldLogs(days);
    return { message: `已清理 ${deleted} 条过期日志`, deleted };
  }

  @Get('my-logs')
  @ApiOperation({ summary: '获取当前用户的操作历史' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '数量限制' })
  async getMyLogs(@CurrentUser() user: User, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return await this.auditLogsService.findUserLogs(user.id, limitNum);
  }
}
