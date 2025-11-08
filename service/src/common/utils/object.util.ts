import * as _ from 'lodash';

/**
 * 对象工具类
 */
export class ObjectUtil {
  /**
   * 深度克隆对象
   * @param obj 对象
   * @returns 克隆后的对象
   */
  static cloneDeep<T>(obj: T): T {
    return _.cloneDeep(obj);
  }

  /**
   * 深度合并对象
   * @param target 目标对象
   * @param sources 源对象
   * @returns 合并后的对象
   */
  static mergeDeep(target: any, ...sources: any[]): any {
    return _.merge(target, ...sources);
  }

  /**
   * 选择对象的指定属性
   * @param obj 对象
   * @param keys 属性键数组
   * @returns 新对象
   */
  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    return _.pick(obj, keys);
  }

  /**
   * 排除对象的指定属性
   * @param obj 对象
   * @param keys 属性键数组
   * @returns 新对象
   */
  static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    return _.omit(obj, keys);
  }

  /**
   * 检查对象是否为空
   * @param obj 对象
   * @returns 是否为空
   */
  static isEmpty(obj: any): boolean {
    return _.isEmpty(obj);
  }

  /**
   * 检查值是否为对象
   * @param value 值
   * @returns 是否为对象
   */
  static isObject(value: any): boolean {
    return _.isObject(value) && !_.isArray(value) && !_.isDate(value);
  }

  /**
   * 扁平化对象
   * @param obj 对象
   * @param prefix 前缀
   * @returns 扁平化后的对象
   */
  static flatten(obj: any, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (this.isObject(obj[key])) {
          Object.assign(result, this.flatten(obj[key], newKey));
        } else {
          result[newKey] = obj[key];
        }
      }
    }
    return result;
  }

  /**
   * 移除对象中的 undefined 和 null 值
   * @param obj 对象
   * @returns 清理后的对象
   */
  static removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] != null) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  /**
   * 获取对象的嵌套属性值
   * @param obj 对象
   * @param path 路径（如 'user.profile.name'）
   * @param defaultValue 默认值
   * @returns 属性值
   */
  static get<T = any>(obj: any, path: string, defaultValue?: T): T | undefined {
    return _.get(obj, path, defaultValue);
  }

  /**
   * 设置对象的嵌套属性值
   * @param obj 对象
   * @param path 路径
   * @param value 值
   * @returns 对象
   */
  static set(obj: any, path: string, value: any): any {
    return _.set(obj, path, value);
  }
}
