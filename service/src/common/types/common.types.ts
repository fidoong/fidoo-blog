/**
 * 通用类型定义
 */

/**
 * 可选类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 必需类型
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 函数类型
 */
export type FunctionType = (...args: any[]) => any;

/**
 * 构造函数类型
 */
export type ConstructorType<T = any> = new (...args: any[]) => T;

/**
 * 键值对类型
 */
export type KeyValuePair<T = any> = Record<string, T>;

/**
 * 空对象类型
 */
export type EmptyObject = Record<string, never>;

/**
 * 异步函数返回类型
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;
