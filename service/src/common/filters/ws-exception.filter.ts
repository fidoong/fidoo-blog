/**
 * WebSocket 异常过滤器
 * 处理 WebSocket 连接中的异常
 */

import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { BusinessException } from '../exceptions/business.exception';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<Socket>();
    const error = exception instanceof Error ? exception : new Error(String(exception));

    this.logger.error(`WebSocket 异常 [${client.id}]:`, error.message);

    // 如果是业务异常，发送错误消息后断开连接
    if (exception instanceof BusinessException) {
      client.emit('error', {
        code: exception.code,
        message: exception.message,
        messageKey: (exception.getResponse() as any)?.messageKey,
      });
    } else {
      // 其他异常
      client.emit('error', {
        code: 500,
        message: error.message || 'WebSocket 连接错误',
      });
    }

    // 断开连接
    client.disconnect();
  }
}

