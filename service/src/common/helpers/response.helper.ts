import { ApiResponseDto } from '../dto/response.dto';
import { PaginationResponseDto } from '../dto/pagination.dto';

/**
 * 响应辅助函数
 */
export class ResponseHelper {
  /**
   * 创建成功响应
   * @param data 数据
   * @param message 消息
   * @returns 成功响应
   */
  static success<T>(data?: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto(data, message);
  }

  /**
   * 创建分页响应
   * @param items 数据列表
   * @param total 总数量
   * @param page 页码
   * @param pageSize 每页数量
   * @param message 消息
   * @returns 成功响应（包含分页数据）
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number,
    message?: string,
  ): ApiResponseDto<PaginationResponseDto<T>> {
    const paginationData = new PaginationResponseDto(items, total, page, pageSize);
    return this.success(paginationData, message);
  }

  /**
   * 创建列表响应
   * @param items 数据列表
   * @param message 消息
   * @returns 成功响应
   */
  static list<T>(items: T[], message?: string): ApiResponseDto<T[]> {
    return this.success(items, message);
  }

  /**
   * 创建单个对象响应
   * @param item 数据对象
   * @param message 消息
   * @returns 成功响应
   */
  static item<T>(item: T, message?: string): ApiResponseDto<T> {
    return this.success(item, message);
  }
}
