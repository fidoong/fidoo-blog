import * as _ from 'lodash';

/**
 * 字符串工具类
 */
export class StringUtil {
  /**
   * 转换为驼峰命名
   * @param str 字符串
   * @returns 驼峰命名
   */
  static toCamelCase(str: string): string {
    return _.camelCase(str);
  }

  /**
   * 转换为帕斯卡命名
   * @param str 字符串
   * @returns 帕斯卡命名
   */
  static toPascalCase(str: string): string {
    return _.upperFirst(_.camelCase(str));
  }

  /**
   * 转换为短横线命名
   * @param str 字符串
   * @returns 短横线命名
   */
  static toKebabCase(str: string): string {
    return _.kebabCase(str);
  }

  /**
   * 转换为蛇形命名
   * @param str 字符串
   * @returns 蛇形命名
   */
  static toSnakeCase(str: string): string {
    return _.snakeCase(str);
  }

  /**
   * 首字母大写
   * @param str 字符串
   * @returns 首字母大写的字符串
   */
  static capitalize(str: string): string {
    return _.capitalize(str);
  }

  /**
   * 首字母小写
   * @param str 字符串
   * @returns 首字母小写的字符串
   */
  static uncapitalize(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * 截断字符串
   * @param str 字符串
   * @param length 长度
   * @param suffix 后缀，默认 '...'
   * @returns 截断后的字符串
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) {
      return str;
    }
    return str.substring(0, length) + suffix;
  }

  /**
   * 移除 HTML 标签
   * @param html HTML 字符串
   * @returns 纯文本
   */
  static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * 提取文本内容（移除 HTML 标签并截断）
   * @param html HTML 字符串
   * @param length 长度
   * @returns 文本内容
   */
  static extractText(html: string, length?: number): string {
    let text = this.stripHtml(html);
    if (length) {
      text = this.truncate(text, length);
    }
    return text.trim();
  }

  /**
   * 生成 slug（URL 友好的字符串）
   * @param str 字符串
   * @returns slug
   */
  static slugify(str: string): string {
    return _.kebabCase(str.toLowerCase());
  }

  /**
   * 掩码处理（用于隐藏敏感信息）
   * @param str 字符串
   * @param start 开始保留长度
   * @param end 结束保留长度
   * @param mask 掩码字符，默认 '*'
   * @returns 掩码后的字符串
   */
  static mask(str: string, start: number = 3, end: number = 4, mask: string = '*'): string {
    if (str.length <= start + end) {
      return mask.repeat(str.length);
    }
    return (
      str.substring(0, start) +
      mask.repeat(str.length - start - end) +
      str.substring(str.length - end)
    );
  }

  /**
   * 验证是否为有效的邮箱
   * @param email 邮箱
   * @returns 是否有效
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证是否为有效的手机号（中国）
   * @param phone 手机号
   * @returns 是否有效
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证是否为有效的 URL
   * @param url URL
   * @returns 是否有效
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
