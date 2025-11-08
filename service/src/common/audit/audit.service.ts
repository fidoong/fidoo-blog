import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

export interface AuditLog {
  traceId: string;
  userId: string;
  action: string;
  resource: string;
  ip: string;
  method: string;
  url: string;
  params?: Record<string, unknown>;
  response?: unknown;
  status: 'success' | 'error';
  error?: {
    message: string;
    stack?: string;
  };
  duration: number;
  timestamp: string;
}

/**
 * 审计服务
 * 提供审计日志的存储和查询功能
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger('AuditService');
  private auditLogs: AuditLog[] = [];

  /**
   * 记录审计日志
   */
  log(auditLog: AuditLog): void {
    this.auditLogs.push(auditLog);
    this.logger.log(`Audit log recorded: ${auditLog.action} by ${auditLog.userId}`);

    // 在实际应用中，这里应该将日志存储到数据库或日志系统
    // 例如：await this.auditRepository.save(auditLog);
  }

  /**
   * 查询审计日志
   */
  async findLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    let logs = [...this.auditLogs];

    if (filters.userId) {
      logs = logs.filter((log) => log.userId === filters.userId);
    }

    if (filters.action) {
      logs = logs.filter((log) => log.action === filters.action);
    }

    if (filters.resource) {
      logs = logs.filter((log) => log.resource === filters.resource);
    }

    if (filters.startTime) {
      logs = logs.filter((log) => new Date(log.timestamp) >= filters.startTime!);
    }

    if (filters.endTime) {
      logs = logs.filter((log) => new Date(log.timestamp) <= filters.endTime!);
    }

    // 按时间倒序排序
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filters.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  /**
   * 根据追踪 ID 查询日志
   */
  async findByTraceId(traceId: string): Promise<AuditLog[]> {
    return this.auditLogs.filter((log) => log.traceId === traceId);
  }
}
