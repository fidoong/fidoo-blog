import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { BusinessException } from '@/common/exceptions';

/**
 * 将字符串转换为布尔值的管道
 */
@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    if (value === 'true' || value === '1') {
      return true;
    }
    if (value === 'false' || value === '0') {
      return false;
    }
    throw BusinessException.badRequest(
      `参数 ${metadata.data} 必须是有效的布尔值 (true/false, 1/0)`,
    );
  }
}
