import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service';

export interface MaskOptions {
  fields?: string[];
  phoneFields?: string[];
  emailFields?: string[];
  idCardFields?: string[];
  bankCardFields?: string[];
}

/**
 * 数据脱敏拦截器
 * 自动对响应中的敏感数据进行脱敏处理
 */
@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(private encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // 这里可以根据需要配置脱敏规则
        // 实际应用中可以通过装饰器或配置来指定需要脱敏的字段
        return this.maskSensitiveData(data);
      }),
    );
  }

  private maskSensitiveData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.maskSensitiveData(item));
    }

    const masked = { ...(data as Record<string, unknown>) };

    // 常见敏感字段脱敏
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'privateKey'];

    const phoneFields = ['phone', 'mobile', 'phoneNumber', 'mobileNumber'];
    const emailFields = ['email'];
    const idCardFields = ['idCard', 'idNumber', 'identityCard'];
    const bankCardFields = ['bankCard', 'cardNumber', 'accountNumber'];

    for (const key in masked) {
      if (Object.prototype.hasOwnProperty.call(masked, key)) {
        const value = masked[key];
        if (sensitiveFields.includes(key)) {
          masked[key] = '***';
        } else if (phoneFields.includes(key) && typeof value === 'string') {
          masked[key] = this.encryptionService.maskPhone(value);
        } else if (emailFields.includes(key) && typeof value === 'string') {
          masked[key] = this.encryptionService.maskEmail(value);
        } else if (idCardFields.includes(key) && typeof value === 'string') {
          masked[key] = this.encryptionService.maskIdCard(value);
        } else if (bankCardFields.includes(key) && typeof value === 'string') {
          masked[key] = this.encryptionService.maskBankCard(value);
        } else if (typeof value === 'object' && value !== null) {
          masked[key] = this.maskSensitiveData(value);
        }
      }
    }

    return masked;
  }
}
