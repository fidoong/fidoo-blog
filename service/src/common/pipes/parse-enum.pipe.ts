import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { BusinessException } from '@/common/exceptions';

/**
 * 将字符串转换为枚举值的管道
 */
@Injectable()
export class ParseEnumPipe<T extends Record<string, string | number>>
  implements PipeTransform<string, T[keyof T]>
{
  constructor(
    private readonly enumType: T,
    private readonly enumName?: string,
  ) {}

  transform(value: string, metadata: ArgumentMetadata): T[keyof T] {
    if (!value) {
      throw BusinessException.badRequest(`参数 ${metadata.data} 不能为空`);
    }

    const enumValues = Object.values(this.enumType) as Array<T[keyof T]>;
    if (!enumValues.includes(value as T[keyof T])) {
      const enumName = this.enumName || '枚举';
      throw BusinessException.badRequest(
        `参数 ${metadata.data} 必须是有效的 ${enumName} 值: ${enumValues.join(', ')}`,
      );
    }

    return value as T[keyof T];
  }
}
