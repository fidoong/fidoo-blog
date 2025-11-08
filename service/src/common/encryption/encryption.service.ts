import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * 加密服务
 * 提供数据加密、解密和脱敏功能
 */
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;

  /**
   * 生成加密密钥
   */
  private getKey(secret: string): Buffer {
    return crypto.createHash('sha256').update(secret).digest();
  }

  /**
   * 加密数据
   */
  encrypt(text: string, secret: string): string {
    const key = this.getKey(secret);
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // 返回格式: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * 解密数据
   */
  decrypt(encryptedText: string, secret: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }

    const [ivHex, authTagHex, encrypted] = parts;
    const key = this.getKey(secret);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * 哈希数据（不可逆）
   */
  hash(text: string, salt?: string): string {
    const hashSalt = salt || crypto.randomBytes(this.saltLength).toString('hex');
    const hash = crypto
      .createHash('sha256')
      .update(text + hashSalt)
      .digest('hex');
    return `${hashSalt}:${hash}`;
  }

  /**
   * 验证哈希
   */
  verifyHash(text: string, hashedText: string): boolean {
    const [salt] = hashedText.split(':');
    const newHash = this.hash(text, salt);
    return newHash === hashedText;
  }

  /**
   * 数据脱敏
   */
  mask(
    data: string,
    options?: {
      start?: number;
      end?: number;
      maskChar?: string;
    },
  ): string {
    if (!data || data.length === 0) {
      return data;
    }

    const { start = 0, end = data.length, maskChar = '*' } = options || {};
    const visibleStart = Math.max(0, start);
    const visibleEnd = Math.min(data.length, end);
    const maskLength = visibleEnd - visibleStart;

    if (maskLength <= 0) {
      return maskChar.repeat(data.length);
    }

    return (
      data.substring(0, visibleStart) + maskChar.repeat(maskLength) + data.substring(visibleEnd)
    );
  }

  /**
   * 手机号脱敏
   */
  maskPhone(phone: string): string {
    if (!phone || phone.length < 7) {
      return phone;
    }
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
  }

  /**
   * 邮箱脱敏
   */
  maskEmail(email: string): string {
    if (!email || !email.includes('@')) {
      return email;
    }
    const [local, domain] = email.split('@');
    const maskedLocal = this.mask(local, { start: 1, end: local.length - 1 });
    return `${maskedLocal}@${domain}`;
  }

  /**
   * 身份证号脱敏
   */
  maskIdCard(idCard: string): string {
    if (!idCard || idCard.length < 8) {
      return idCard;
    }
    return idCard.substring(0, 4) + '**********' + idCard.substring(idCard.length - 4);
  }

  /**
   * 银行卡号脱敏
   */
  maskBankCard(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 8) {
      return cardNumber;
    }
    return cardNumber.substring(0, 4) + ' **** **** ' + cardNumber.substring(cardNumber.length - 4);
  }
}
