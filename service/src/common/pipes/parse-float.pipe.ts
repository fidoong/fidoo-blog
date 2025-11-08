import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { BusinessException } from '@/common/exceptions';

/**
 * 将字符串转换为浮点数的管道
 */
@Injectable()
export class ParseFloatPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseFloat(value);
    if (isNaN(val)) {
      throw BusinessException.badRequest(`参数 ${metadata.data} 必须是有效的数字`);
    }
    return val;
  }
}
