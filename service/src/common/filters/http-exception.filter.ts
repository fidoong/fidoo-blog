/**
 * HTTP 异常过滤器
 * 统一处理所有异常，返回统一的业务异常格式
 *
 * 设计理念：
 * - 业务异常（BusinessException）：HTTP 200 + code（非 0）= 业务失败
 * - HTTP 异常（HttpException）：保持原有 HTTP 状态码（如 404、500）
 * - 系统错误（Error）：HTTP 500 + code: 500
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseCode } from '../enums/response-code.enum';
import { BusinessException } from '../exceptions/business.exception';

/**
 * 错误响应接口
 */
interface ErrorResponse {
  code: number; // 业务错误码
  message: string; // 错误消息
  data?: unknown; // 错误详情数据
  timestamp: string; // 时间戳
}

/**
 * HTTP 异常过滤器
 * 捕获所有异常并转换为统一的业务异常格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let httpStatus = HttpStatus.OK; // 默认使用 200，业务错误通过 code 表示
    let code = ResponseCode.INTERNAL_ERROR;
    let message = '服务器内部错误';
    let errorData: unknown = undefined;

    // 处理业务异常（BusinessException）
    // 业务异常始终返回 HTTP 200，错误通过 code 字段表示
    if (exception instanceof BusinessException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as {
          code?: number;
          message?: string;
          data?: unknown;
        };
        code = responseObj.code ?? ResponseCode.INTERNAL_ERROR;
        message = responseObj.message || exception.message;
        errorData = responseObj.data;
      } else {
        code = exception.code;
        message = exceptionResponse as string;
        errorData = exception.data;
      }
      // 业务异常始终使用 HTTP 200
      httpStatus = HttpStatus.OK;
    }
    // 处理 NestJS HTTP 异常（如路由不存在、验证失败等）
    // 这些异常保持原有的 HTTP 状态码
    else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // 映射 HTTP 状态码到业务错误码
      code = this.mapHttpStatusToCode(httpStatus);

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as {
          message?: string | string[];
          errors?: unknown;
        };
        // 处理消息可能是数组的情况（验证错误）
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
        } else {
          message = responseObj.message || exception.message;
        }
        errorData = responseObj.errors;
      } else {
        message = exceptionResponse as string;
      }
    }
    // 处理系统错误（如代码异常、未捕获的错误）
    else if (exception instanceof Error) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      code = ResponseCode.INTERNAL_ERROR;
      message = exception.message || '服务器内部错误';
    }

    // 构建错误响应
    const errorResponse: ErrorResponse = {
      code,
      message,
      timestamp: new Date().toISOString(),
      ...(errorData !== undefined && { data: errorData }),
    };

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      exception instanceof Error ? exception.stack : '',
    );

    // 返回错误响应
    response.status(httpStatus).json(errorResponse);
  }

  /**
   * 映射 HTTP 状态码到业务错误码
   */
  private mapHttpStatusToCode(httpStatus: number): number {
    switch (httpStatus) {
      case HttpStatus.BAD_REQUEST:
        return ResponseCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ResponseCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ResponseCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ResponseCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ResponseCode.CONFLICT;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ResponseCode.VALIDATION_ERROR;
      default:
        return ResponseCode.INTERNAL_ERROR;
    }
  }
}
