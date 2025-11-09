import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

/**
 * i18n 服务辅助类
 * 提供便捷的翻译方法
 */
@Injectable()
export class AppI18nService {
  constructor(private readonly i18n: I18nService) {}

  /**
   * 翻译错误消息
   * @param key 翻译键
   * @param args 参数
   * @param lang 语言代码（可选，默认使用请求语言）
   */
  translateError(key: string, args?: Record<string, any>, lang?: string): string {
    return this.i18n.translate(`errors.${key}`, {
      args,
      lang,
    });
  }

  /**
   * 翻译成功消息
   * @param key 翻译键
   * @param args 参数
   * @param lang 语言代码（可选，默认使用请求语言）
   */
  translateSuccess(key: string, args?: Record<string, any>, lang?: string): string {
    return this.i18n.translate(`success.${key}`, {
      args,
      lang,
    });
  }

  /**
   * 通用翻译方法
   * @param key 翻译键（支持嵌套，如 'errors.userNotFound'）
   * @param args 参数
   * @param lang 语言代码（可选，默认使用请求语言）
   */
  translate(key: string, args?: Record<string, any>, lang?: string): string {
    return this.i18n.translate(key, {
      args,
      lang,
    });
  }
}

