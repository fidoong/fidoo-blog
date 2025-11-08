import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { BusinessException } from '@/common/exceptions';

/**
 * 将字符串转换为整数的管道
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw BusinessException.badRequest(`参数 ${metadata.data} 必须是有效的整数`);
    }
    return val;
  }
}
