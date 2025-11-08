import * as bcrypt from 'bcrypt';

/**
 * 加密工具类
 */
export class CryptoUtil {
  /**
   * 生成密码哈希
   * @param password 原始密码
   * @param saltRounds 盐值轮数，默认 10
   * @returns 哈希后的密码
   */
  static async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * 验证密码
   * @param password 原始密码
   * @param hash 哈希密码
   * @returns 是否匹配
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * 生成随机字符串
   * @param length 长度
   * @returns 随机字符串
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机数字字符串
   * @param length 长度
   * @returns 随机数字字符串
   */
  static generateRandomNumber(length: number = 6): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }
}
