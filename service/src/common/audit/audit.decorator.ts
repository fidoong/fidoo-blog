import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA = 'audit';

export interface AuditOptions {
  /** 操作类型 */
  action: string;
  /** 资源类型 */
  resource?: string;
  /** 是否记录请求参数 */
  logParams?: boolean;
  /** 是否记录响应数据 */
  logResponse?: boolean;
  /** 敏感字段（不记录） */
  sensitiveFields?: string[];
}

/**
 * 审计日志装饰器
 * @param options 审计配置
 */
export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_METADATA, options);

/**
 * 跳过审计装饰器
 */
export const SkipAudit = () => SetMetadata(AUDIT_METADATA, { skip: true });
