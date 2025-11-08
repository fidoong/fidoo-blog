import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

/**
 * 追踪服务
 * 提供追踪相关的工具方法
 */
@Injectable()
export class TracingService {
  /**
   * 生成追踪 ID
   */
  generateTraceId(): string {
    return uuidv4();
  }

  /**
   * 从请求中提取追踪 ID
   */
  extractTraceId(headers: Record<string, string | string[] | undefined>): string | null {
    const traceId =
      (headers['x-trace-id'] as string) || (headers['x-request-id'] as string) || null;
    return traceId || null;
  }

  /**
   * 创建追踪上下文
   */
  createTraceContext(traceId: string, metadata?: Record<string, unknown>) {
    return {
      traceId,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
  }
}
