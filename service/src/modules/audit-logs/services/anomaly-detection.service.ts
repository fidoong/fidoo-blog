/**
 * 异常检测服务
 * 检测异常登录行为和可疑操作
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { AuditLog, AuditAction, AuditSeverity } from '../entities/audit-log.entity';
import { DeviceService } from '@/modules/auth/services/device.service';
import { AuditLogsService } from '../audit-logs.service';

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  severity: AuditSeverity;
  reasons: string[];
  score: number; // 异常分数 0-100
}

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private auditLogsService: AuditLogsService,
  ) {}

  /**
   * 检测登录异常
   */
  async detectLoginAnomaly(
    userId: string,
    ip: string,
    userAgent: string,
    deviceId: string,
    isNewDevice?: boolean, // 从外部传入，避免循环依赖
  ): Promise<AnomalyDetectionResult> {
    const reasons: string[] = [];
    let score = 0;

    // 1. 检查是否是新设备
    if (isNewDevice !== undefined) {
      if (isNewDevice) {
        reasons.push('新设备登录');
        score += 20;
      }
    } else {
      // 如果没有传入，通过查询设备记录判断
      const recentLogs = await this.auditLogRepository.find({
        where: {
          userId,
          deviceId,
        },
        take: 1,
      });
      if (recentLogs.length === 0) {
        reasons.push('新设备登录');
        score += 20;
      }
    }

    // 2. 检查是否是新 IP
    const recentLogs = await this.auditLogRepository.find({
      where: {
        userId,
        action: AuditAction.LOGIN,
        timestamp: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 最近 30 天
      },
      order: { timestamp: 'DESC' },
      take: 100,
    });

    const knownIps = new Set(recentLogs.map((log) => log.ip).filter(Boolean));
    const isNewIp = !knownIps.has(ip);
    if (isNewIp) {
      reasons.push('新 IP 地址登录');
      score += 15;
    }

    // 3. 检查短时间内多次登录失败
    const recentFailedLogins = await this.auditLogRepository.count({
      where: {
        userId,
        action: AuditAction.LOGIN,
        status: 'error' as any,
        timestamp: MoreThan(new Date(Date.now() - 15 * 60 * 1000)), // 最近 15 分钟
      },
    });

    if (recentFailedLogins >= 3) {
      reasons.push(`短时间内 ${recentFailedLogins} 次登录失败`);
      score += 30;
    }

    // 4. 检查异常时间登录（凌晨 2-6 点）
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 6) {
      reasons.push('异常时间登录（凌晨 2-6 点）');
      score += 10;
    }

    // 5. 检查地理位置异常（如果 IP 变化很大）
    // 这里可以集成 IP 地理位置服务

    // 6. 检查用户代理异常
    if (!userAgent || userAgent.length < 10) {
      reasons.push('异常的用户代理');
      score += 5;
    }

    // 确定严重程度
    let severity: AuditSeverity = AuditSeverity.LOW;
    if (score >= 50) {
      severity = AuditSeverity.CRITICAL;
    } else if (score >= 30) {
      severity = AuditSeverity.HIGH;
    } else if (score >= 15) {
      severity = AuditSeverity.MEDIUM;
    }

    const isAnomaly = score >= 15; // 分数超过 15 认为是异常

    return {
      isAnomaly,
      severity,
      reasons,
      score,
    };
  }

  /**
   * 检测操作异常
   */
  async detectOperationAnomaly(
    userId: string,
    action: AuditAction,
    ip: string,
    resource?: string,
  ): Promise<AnomalyDetectionResult> {
    const reasons: string[] = [];
    let score = 0;

    // 1. 检查操作频率异常
    const recentActions = await this.auditLogRepository.count({
      where: {
        userId,
        action,
        timestamp: MoreThan(new Date(Date.now() - 60 * 1000)), // 最近 1 分钟
      },
    });

    // 根据操作类型设置阈值
    const thresholds: Record<AuditAction, number> = {
      [AuditAction.LOGIN]: 5,
      [AuditAction.POST_DELETE]: 10,
      [AuditAction.USER_DELETE]: 3,
      [AuditAction.PERMISSION_GRANT]: 5,
      // ... 其他操作
    } as Record<AuditAction, number>;

    const threshold = thresholds[action] || 20;
    if (recentActions > threshold) {
      reasons.push(`操作频率异常：${recentActions} 次/分钟`);
      score += 25;
    }

    // 2. 检查敏感操作（删除、权限变更等）
    const sensitiveActions = [
      AuditAction.USER_DELETE,
      AuditAction.POST_DELETE,
      AuditAction.PERMISSION_GRANT,
      AuditAction.PERMISSION_REVOKE,
      AuditAction.ROLE_ASSIGN,
      AuditAction.FORCE_LOGOUT,
    ];

    if (sensitiveActions.includes(action)) {
      reasons.push('敏感操作');
      score += 15;
    }

    // 3. 检查批量操作
    if (resource && resource.includes('batch')) {
      reasons.push('批量操作');
      score += 10;
    }

    // 确定严重程度
    let severity: AuditSeverity = AuditSeverity.LOW;
    if (score >= 40) {
      severity = AuditSeverity.CRITICAL;
    } else if (score >= 25) {
      severity = AuditSeverity.HIGH;
    } else if (score >= 15) {
      severity = AuditSeverity.MEDIUM;
    }

    const isAnomaly = score >= 15;

    return {
      isAnomaly,
      severity,
      reasons,
      score,
    };
  }

  /**
   * 检测 IP 异常
   */
  async detectIpAnomaly(ip: string): Promise<AnomalyDetectionResult> {
    const reasons: string[] = [];
    let score = 0;

    // 1. 检查该 IP 的失败登录次数
    const recentFailedLogins = await this.auditLogRepository.count({
      where: {
        ip,
        action: AuditAction.LOGIN,
        status: 'error' as any,
        timestamp: MoreThan(new Date(Date.now() - 60 * 60 * 1000)), // 最近 1 小时
      },
    });

    if (recentFailedLogins >= 10) {
      reasons.push(`该 IP 在 1 小时内 ${recentFailedLogins} 次登录失败`);
      score += 40;
    }

    // 2. 检查该 IP 的异常操作数量
    const recentAnomalies = await this.auditLogRepository.count({
      where: {
        ip,
        isAnomaly: true,
        timestamp: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 最近 24 小时
      },
    });

    if (recentAnomalies >= 5) {
      reasons.push(`该 IP 在 24 小时内有 ${recentAnomalies} 次异常操作`);
      score += 30;
    }

    // 确定严重程度
    let severity: AuditSeverity = AuditSeverity.LOW;
    if (score >= 50) {
      severity = AuditSeverity.CRITICAL;
    } else if (score >= 30) {
      severity = AuditSeverity.HIGH;
    } else if (score >= 15) {
      severity = AuditSeverity.MEDIUM;
    }

    const isAnomaly = score >= 15;

    return {
      isAnomaly,
      severity,
      reasons,
      score,
    };
  }
}
