import { Injectable } from '@nestjs/common';
import { plainToInstance, instanceToPlain } from 'class-transformer';

/**
 * 数据转换服务
 * 提供数据转换、序列化、反序列化等功能
 */
@Injectable()
export class TransformService {
  /**
   * 将普通对象转换为类实例
   */
  plainToClass<T>(cls: new () => T, plain: any): T {
    return plainToInstance(cls, plain, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  /**
   * 将类实例转换为普通对象
   */
  classToPlain<T>(instance: T): any {
    return instanceToPlain(instance, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * 转换数组
   */
  plainToClassArray<T>(cls: new () => T, plainArray: any[]): T[] {
    return plainArray.map((item) => this.plainToClass(cls, item));
  }

  /**
   * 转换分页数据
   */
  transformPaginated<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number,
    transformer?: (item: T) => any,
  ) {
    return {
      items: transformer ? data.map(transformer) : data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 转换嵌套对象
   */
  transformNested<T>(data: any, nestedFields: { [key: string]: new () => any }): T {
    const transformed = { ...data };

    for (const [field, cls] of Object.entries(nestedFields)) {
      if (data[field]) {
        if (Array.isArray(data[field])) {
          transformed[field] = this.plainToClassArray(cls, data[field]);
        } else {
          transformed[field] = this.plainToClass(cls, data[field]);
        }
      }
    }

    return transformed as T;
  }

  /**
   * 选择字段
   */
  pickFields<T extends Record<string, any>>(data: T, fields: (keyof T)[]): Partial<T> {
    const result: Partial<T> = {};
    fields.forEach((field) => {
      if (field in data) {
        result[field] = data[field];
      }
    });
    return result;
  }

  /**
   * 排除字段
   */
  omitFields<T>(data: T, fields: (keyof T)[]): Partial<T> {
    const result: any = { ...data };
    fields.forEach((field) => {
      delete result[field];
    });
    return result;
  }

  /**
   * 扁平化对象
   */
  flatten(obj: any, prefix = '', result: any = {}): any {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          this.flatten(obj[key], newKey, result);
        } else {
          result[newKey] = obj[key];
        }
      }
    }
    return result;
  }

  /**
   * 反扁平化对象
   */
  unflatten(flatObj: any): any {
    const result: any = {};
    for (const key in flatObj) {
      if (Object.prototype.hasOwnProperty.call(flatObj, key)) {
        const keys = key.split('.');
        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in current)) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = flatObj[key];
      }
    }
    return result;
  }
}
