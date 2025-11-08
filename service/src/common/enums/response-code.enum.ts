/**
 * 响应代码枚举
 * code: 0 表示成功，非 0 表示业务失败
 */
export enum ResponseCode {
  SUCCESS = 0, // 成功
  BAD_REQUEST = 400, // 请求参数错误
  UNAUTHORIZED = 401, // 未授权
  FORBIDDEN = 403, // 禁止访问
  NOT_FOUND = 404, // 资源不存在
  CONFLICT = 409, // 资源冲突
  VALIDATION_ERROR = 422, // 验证错误
  INTERNAL_ERROR = 500, // 服务器内部错误
}
