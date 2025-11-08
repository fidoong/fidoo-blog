import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AUDIT_METADATA, AuditOptions } from './audit.decorator';
import { Logger } from '@nestjs/common';

/**
 * 审计日志拦截器
 * 记录用户操作日志，用于审计和问题排查
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    // 获取审计配置
    const auditOptions = this.reflector.getAllAndOverride<AuditOptions | { skip: boolean }>(
      AUDIT_METADATA,
      [handler, controller],
    );

    // 如果跳过审计，直接执行
    if (auditOptions && 'skip' in auditOptions && auditOptions.skip) {
      return next.handle();
    }

    // 如果没有配置审计，不记录
    if (!auditOptions || !('action' in auditOptions)) {
      return next.handle();
    }

    const options = auditOptions as AuditOptions;
    const startTime = Date.now();
    const traceId = (request as any).traceId || '';
    const user = (request as any).user || null;
    const userId = user?.id || user?.userId || 'anonymous';
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const method = request.method;
    const url = request.originalUrl || request.url;

    // 准备审计数据
    const auditData: any = {
      traceId,
      userId,
      ip,
      method,
      url,
      action: options.action,
      resource: options.resource || controller.name,
      timestamp: new Date().toISOString(),
    };

    // 记录请求参数（如果需要）
    if (options.logParams) {
      auditData.params = this.sanitizeData(
        { ...request.body, ...request.query, ...request.params },
        options.sensitiveFields || [],
      );
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          auditData.duration = duration;
          auditData.status = 'success';

          // 记录响应数据（如果需要）
          if (options.logResponse) {
            auditData.response = this.sanitizeData(data, options.sensitiveFields || []);
          }

          this.logger.log(JSON.stringify(auditData));
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          auditData.duration = duration;
          auditData.status = 'error';
          auditData.error = {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          };

          this.logger.error(JSON.stringify(auditData));
        },
      }),
    );
  }

  /**
   * 清理敏感数据
   */
  private sanitizeData(data: any, sensitiveFields: string[]): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }
}
