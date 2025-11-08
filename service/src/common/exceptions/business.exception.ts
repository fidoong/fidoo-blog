/**
 * 业务异常类
 * 用于抛出业务层面的异常，支持自定义业务错误码
 *
 * 设计理念：
 * - HTTP 状态码始终为 200（表示请求成功到达服务器并被处理）
 * - 业务错误通过响应体中的 code 字段表示（0 = 成功，非 0 = 业务失败）
 */

import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseCode } from '../enums/response-code.enum';

export interface BusinessExceptionOptions {
  code: number; // 业务错误码（必须指定）
  message: string; // 错误消息
  data?: unknown; // 错误详情数据
}

/**
 * 业务异常类
 * 继承自 HttpException，但始终使用 HTTP 200 状态码
 * 业务错误通过 code 字段表示
 */
export class BusinessException extends HttpException {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(options: BusinessExceptionOptions) {
    const { code, message, data } = options;

    // 构建响应体
    const responseBody: { code: number; message: string; data?: unknown } = {
      code,
      message,
    };
    if (data !== undefined) {
      responseBody.data = data;
    }

    // 业务异常始终使用 HTTP 200 状态码
    // 业务错误通过 code 字段表示
    super(responseBody, HttpStatus.OK);

    this.code = code;
    this.data = data;
  }

  /**
   * 创建参数错误异常
   * HTTP 200 + code: 400
   */
  static badRequest(message: string, data?: unknown): BusinessException {
    return new BusinessException({
      code: ResponseCode.BAD_REQUEST,
      message,
      data,
    });
  }

  /**
   * 创建未授权异常（业务层面）
   * HTTP 200 + code: 401
   * 例如：密码错误、token 无效等业务错误
   */
  static unauthorized(message: string = '未授权', data?: unknown): BusinessException {
    return new BusinessException({
      code: ResponseCode.UNAUTHORIZED,
      message,
      data,
    });
  }

  /**
   * 创建禁止访问异常（业务层面）
   * HTTP 200 + code: 403
   */
  static forbidden(message: string = '禁止访问', data?: unknown): BusinessException {
    return new BusinessException({
      code: ResponseCode.FORBIDDEN,
      message,
      data,
    });
  }

  /**
   * 创建资源不存在异常（业务层面）
   * HTTP 200 + code: 404
   */
  static notFound(message: string, data?: unknown): BusinessException {
    return new BusinessException({
      code: ResponseCode.NOT_FOUND,
      message,
      data,
    });
  }

  /**
   * 创建资源冲突异常（业务层面）
   * HTTP 200 + code: 409
   */
  static conflict(message: string, data?: unknown): BusinessException {
    return new BusinessException({
      code: ResponseCode.CONFLICT,
      message,
      data,
    });
  }

  /**
   * 创建验证错误异常（业务层面）
   * HTTP 200 + code: 422
   */
  static validationError(message: string, data?: unknown): BusinessException {
    return new BusinessException({
      code: ResponseCode.VALIDATION_ERROR,
      message,
      data,
    });
  }

  /**
   * 创建服务器内部错误异常（业务层面）
   * HTTP 200 + code: 500
   * 注意：真正的服务器错误（如代码异常）应该直接抛出 Error，由过滤器处理
   */
  static internalError(message: string = '服务器内部错误', data?: unknown): BusinessException {
    return new BusinessException({
      code: ResponseCode.INTERNAL_ERROR,
      message,
      data,
    });
  }
}
