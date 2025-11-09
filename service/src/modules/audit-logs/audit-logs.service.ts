/**
 * 审计日志服务
 * 提供审计日志的存储和查询功能
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { AuditLog, AuditAction, AuditStatus, AuditSeverity } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  traceId?: string;
  userId?: string;
  username?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  method?: string;
  url?: string;
  params?: Record<string, unknown>;
  response?: unknown;
  status: AuditStatus;
  severity?: AuditSeverity;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  duration?: number;
  metadata?: Record<string, unknown>;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface QueryAuditLogsDto {
  userId?: string;
  username?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  ip?: string;
  status?: AuditStatus;
  severity?: AuditSeverity;
  isAnomaly?: boolean;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * 创建审计日志
   */
  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      ...dto,
      timestamp: new Date(),
    });
    return await this.auditLogRepository.save(log);
  }

  /**
   * 查询审计日志
   */
  async findLogs(dto: QueryAuditLogsDto): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');

    if (dto.userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId: dto.userId });
    }

    if (dto.username) {
      queryBuilder.andWhere('log.username LIKE :username', { username: `%${dto.username}%` });
    }

    if (dto.action) {
      queryBuilder.andWhere('log.action = :action', { action: dto.action });
    }

    if (dto.resource) {
      queryBuilder.andWhere('log.resource = :resource', { resource: dto.resource });
    }

    if (dto.resourceId) {
      queryBuilder.andWhere('log.resourceId = :resourceId', { resourceId: dto.resourceId });
    }

    if (dto.ip) {
      queryBuilder.andWhere('log.ip = :ip', { ip: dto.ip });
    }

    if (dto.status) {
      queryBuilder.andWhere('log.status = :status', { status: dto.status });
    }

    if (dto.severity) {
      queryBuilder.andWhere('log.severity = :severity', { severity: dto.severity });
    }

    if (dto.isAnomaly !== undefined) {
      queryBuilder.andWhere('log.isAnomaly = :isAnomaly', { isAnomaly: dto.isAnomaly });
    }

    if (dto.startTime) {
      queryBuilder.andWhere('log.timestamp >= :startTime', { startTime: dto.startTime });
    }

    if (dto.endTime) {
      queryBuilder.andWhere('log.timestamp <= :endTime', { endTime: dto.endTime });
    }

    // 获取总数
    const total = await queryBuilder.getCount();

    // 排序和分页
    queryBuilder.orderBy('log.timestamp', 'DESC');

    if (dto.offset) {
      queryBuilder.skip(dto.offset);
    }

    if (dto.limit) {
      queryBuilder.take(dto.limit);
    }

    const logs = await queryBuilder.getMany();

    return { logs, total };
  }

  /**
   * 根据 ID 查询日志
   */
  async findById(id: string): Promise<AuditLog | null> {
    return await this.auditLogRepository.findOne({ where: { id } });
  }

  /**
   * 根据追踪 ID 查询日志
   */
  async findByTraceId(traceId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { traceId },
      order: { timestamp: 'ASC' },
    });
  }

  /**
   * 查询异常日志
   */
  async findAnomalies(dto: Omit<QueryAuditLogsDto, 'isAnomaly'>): Promise<AuditLog[]> {
    const { logs } = await this.findLogs({ ...dto, isAnomaly: true });
    return logs;
  }

  /**
   * 查询用户的操作历史
   */
  async findUserLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * 查询 IP 的操作历史
   */
  async findIpLogs(ip: string, limit: number = 100): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { ip },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * 清理过期日志（保留最近 N 天）
   */
  async cleanOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogRepository.delete({
      timestamp: LessThan(cutoffDate),
    });

    this.logger.log(`清理了 ${result.affected || 0} 条过期审计日志`);
    return result.affected || 0;
  }

  /**
   * 统计操作数量
   */
  async countByAction(action: AuditAction, startTime?: Date, endTime?: Date): Promise<number> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');
    queryBuilder.where('log.action = :action', { action });

    if (startTime) {
      queryBuilder.andWhere('log.timestamp >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('log.timestamp <= :endTime', { endTime });
    }

    return await queryBuilder.getCount();
  }

  /**
   * 统计异常操作数量
   */
  async countAnomalies(startTime?: Date, endTime?: Date): Promise<number> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');
    queryBuilder.where('log.isAnomaly = :isAnomaly', { isAnomaly: true });

    if (startTime) {
      queryBuilder.andWhere('log.timestamp >= :startTime', { startTime });
    }

    if (endTime) {
      queryBuilder.andWhere('log.timestamp <= :endTime', { endTime });
    }

    return await queryBuilder.getCount();
  }
}
