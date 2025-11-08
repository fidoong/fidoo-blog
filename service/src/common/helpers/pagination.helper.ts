import { PaginationDto, PaginationResponseDto } from '../dto/pagination.dto';

/**
 * 分页辅助函数
 */
export class PaginationHelper {
  /**
   * 创建分页响应
   * @param items 数据列表
   * @param total 总数量
   * @param pagination 分页参数
   * @returns 分页响应
   */
  static createResponse<T>(
    items: T[],
    total: number,
    pagination: PaginationDto,
  ): PaginationResponseDto<T> {
    return new PaginationResponseDto<T>(
      items,
      total,
      pagination.page || 1,
      pagination.pageSize || 10,
    );
  }

  /**
   * 计算分页参数
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 分页参数对象
   */
  static calculate(page: number = 1, pageSize: number = 10) {
    const normalizedPage = Math.max(1, page);
    const normalizedPageSize = Math.max(1, Math.min(100, pageSize));
    return {
      page: normalizedPage,
      pageSize: normalizedPageSize,
      skip: (normalizedPage - 1) * normalizedPageSize,
      take: normalizedPageSize,
    };
  }

  /**
   * 验证分页参数
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 是否有效
   */
  static isValid(page?: number, pageSize?: number): boolean {
    if (page !== undefined && (page < 1 || !Number.isInteger(page))) {
      return false;
    }
    if (pageSize !== undefined && (pageSize < 1 || pageSize > 100 || !Number.isInteger(pageSize))) {
      return false;
    }
    return true;
  }
}
