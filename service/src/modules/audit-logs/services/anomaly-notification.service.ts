/**
 * 异常通知服务
 * 当检测到异常时发送通知给用户和管理员
 */

import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { NotificationType } from '@/modules/notifications/entities/notification.entity';
import { UsersService } from '@/modules/users/users.service';
import { User, UserRoleEnum } from '@/modules/users/entities/user.entity';
import { AuditSeverity } from '../entities/audit-log.entity';
import type { AnomalyDetectionResult } from './anomaly-detection.service';

export interface AnomalyNotificationOptions {
  userId: string;
  username: string;
  action: string;
  severity: AuditSeverity;
  reasons: string[];
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AnomalyNotificationService {
  private readonly logger = new Logger(AnomalyNotificationService.name);

  constructor(
    private notificationsService: NotificationsService,
    private usersService: UsersService,
  ) {}

  /**
   * 发送异常通知
   */
  async sendAnomalyNotification(options: AnomalyNotificationOptions): Promise<void> {
    const { userId, username, action, severity, reasons, ip, userAgent, metadata } = options;

    try {
      // 1. 发送通知给用户本人（如果是严重异常）
      if (severity === AuditSeverity.CRITICAL || severity === AuditSeverity.HIGH) {
        await this.notifyUser(userId, action, severity, reasons, ip);
      }

      // 2. 发送通知给所有管理员
      await this.notifyAdmins(userId, username, action, severity, reasons, ip, userAgent, metadata);
    } catch (error) {
      this.logger.error('发送异常通知失败', error);
      // 不抛出错误，避免影响主流程
    }
  }

  /**
   * 通知用户本人
   */
  private async notifyUser(
    userId: string,
    action: string,
    severity: AuditSeverity,
    reasons: string[],
    ip?: string,
  ): Promise<void> {
    const severityText = this.getSeverityText(severity);
    const title = `安全提醒：检测到${severityText}异常操作`;
    const content = `您的账户检测到异常操作：${action}\n异常原因：${reasons.join('；')}\n${
      ip ? `IP 地址：${ip}\n` : ''
    }如果这不是您的操作，请立即修改密码并联系管理员。`;

    await this.notificationsService.create({
      recipientId: userId,
      type: NotificationType.SYSTEM,
      title,
      content,
      targetType: 'security',
    });

    this.logger.log(`已向用户 ${userId} 发送异常通知`);
  }

  /**
   * 通知管理员
   */
  private async notifyAdmins(
    userId: string,
    username: string,
    action: string,
    severity: AuditSeverity,
    reasons: string[],
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    // 获取所有管理员
    const admins = await this.usersService.findByRole(UserRoleEnum.ADMIN);

    if (admins.length === 0) {
      this.logger.warn('未找到管理员，无法发送异常通知');
      return;
    }

    const severityText = this.getSeverityText(severity);
    const title = `[${severityText}] 检测到用户异常操作`;
    const content = `用户：${username} (${userId})\n操作：${action}\n异常原因：${reasons.join('；')}\n${
      ip ? `IP 地址：${ip}\n` : ''
    }${userAgent ? `User Agent：${userAgent}\n` : ''}${
      metadata ? `详细信息：${JSON.stringify(metadata, null, 2)}\n` : ''
    }请及时处理。`;

    // 向所有管理员发送通知
    const notificationPromises = admins.map((admin: User) =>
      this.notificationsService.create({
        recipientId: admin.id,
        type: NotificationType.SYSTEM,
        title,
        content,
        targetType: 'security',
        targetId: userId,
      }),
    );

    await Promise.all(notificationPromises);
    this.logger.log(`已向 ${admins.length} 位管理员发送异常通知`);
  }

  /**
   * 获取严重程度文本
   */
  private getSeverityText(severity: AuditSeverity): string {
    const severityMap: Record<AuditSeverity, string> = {
      [AuditSeverity.LOW]: '低',
      [AuditSeverity.MEDIUM]: '中',
      [AuditSeverity.HIGH]: '高',
      [AuditSeverity.CRITICAL]: '严重',
    };
    return severityMap[severity] || severity;
  }

  /**
   * 发送登录异常通知
   */
  async sendLoginAnomalyNotification(
    userId: string,
    username: string,
    anomalyResult: AnomalyDetectionResult,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.sendAnomalyNotification({
      userId,
      username,
      action: '登录',
      severity: anomalyResult.severity,
      reasons: anomalyResult.reasons,
      ip,
      userAgent,
      metadata: {
        ...metadata,
        anomalyScore: anomalyResult.score,
      },
    });
  }

  /**
   * 发送操作异常通知
   */
  async sendOperationAnomalyNotification(
    userId: string,
    username: string,
    action: string,
    anomalyResult: AnomalyDetectionResult,
    ip?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.sendAnomalyNotification({
      userId,
      username,
      action,
      severity: anomalyResult.severity,
      reasons: anomalyResult.reasons,
      ip,
      userAgent,
      metadata,
    });
  }

  /**
   * 发送 IP 异常通知
   */
  async sendIpAnomalyNotification(
    ip: string,
    anomalyResult: AnomalyDetectionResult,
    affectedUsers?: Array<{ userId: string; username: string }>,
  ): Promise<void> {
    // 获取所有管理员
    const admins = await this.usersService.findByRole(UserRoleEnum.ADMIN);

    if (admins.length === 0) {
      return;
    }

    const severityText = this.getSeverityText(anomalyResult.severity);
    const title = `[${severityText}] 检测到 IP 异常活动`;
    const content = `IP 地址：${ip}\n异常原因：${anomalyResult.reasons.join('；')}\n${
      affectedUsers && affectedUsers.length > 0
        ? `受影响用户：${affectedUsers.map((u) => `${u.username} (${u.userId})`).join('、')}\n`
        : ''
    }请及时处理。`;

    const notificationPromises = admins.map((admin: User) =>
      this.notificationsService.create({
        recipientId: admin.id,
        type: NotificationType.SYSTEM,
        title,
        content,
        targetType: 'security',
        targetId: ip,
      }),
    );

    await Promise.all(notificationPromises);
    this.logger.log(`已向 ${admins.length} 位管理员发送 IP 异常通知`);
  }
}
