import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { QueryDto } from '../dto/query.dto';
import { FilterCondition } from '../types/query.types';

/**
 * 查询构建器辅助函数
 */
export class QueryBuilderHelper {
  /**
   * 应用分页
   * @param queryBuilder 查询构建器
   * @param pagination 分页参数
   * @returns 查询构建器
   */
  static applyPagination<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    pagination: { page?: number; pageSize?: number; limit?: number },
  ): SelectQueryBuilder<T> {
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || pagination.limit || 10;
    return queryBuilder.skip((page - 1) * pageSize).take(pageSize);
  }

  /**
   * 应用排序
   * @param queryBuilder 查询构建器
   * @param sortBy 排序字段
   * @param sortOrder 排序方向
   * @param defaultSortBy 默认排序字段
   * @returns 查询构建器
   */
  static applySort<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    defaultSortBy: string = 'createdAt',
  ): SelectQueryBuilder<T> {
    // 如果已经设置了排序，不重复设置
    const orderBys = queryBuilder.expressionMap.orderBys;
    if (orderBys && Object.keys(orderBys).length > 0) {
      return queryBuilder;
    }
    const orderBy = sortBy || defaultSortBy;
    return queryBuilder.orderBy(orderBy, sortOrder);
  }

  /**
   * 应用关键词搜索
   * @param queryBuilder 查询构建器
   * @param keyword 关键词
   * @param fields 搜索字段数组
   * @returns 查询构建器
   */
  static applyKeywordSearch<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    keyword?: string,
    fields: string[] = [],
  ): SelectQueryBuilder<T> {
    if (!keyword || fields.length === 0) {
      return queryBuilder;
    }

    const conditions = fields
      .map((field, index) => {
        const paramName = `keyword_${index}`;
        return `${field} LIKE :${paramName}`;
      })
      .join(' OR ');

    const parameters: Record<string, string> = {};
    fields.forEach((field, index) => {
      parameters[`keyword_${index}`] = `%${keyword}%`;
    });

    return queryBuilder.andWhere(`(${conditions})`, parameters);
  }

  /**
   * 应用日期范围过滤
   * @param queryBuilder 查询构建器
   * @param field 日期字段
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 查询构建器
   */
  static applyDateRange<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    field: string,
    startDate?: string,
    endDate?: string,
  ): SelectQueryBuilder<T> {
    if (startDate) {
      queryBuilder.andWhere(`${field} >= :startDate`, {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere(`${field} <= :endDate`, {
        endDate,
      });
    }
    return queryBuilder;
  }

  /**
   * 应用过滤条件
   * @param queryBuilder 查询构建器
   * @param filters 过滤条件数组
   * @returns 查询构建器
   */
  static applyFilters<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: FilterCondition[],
  ): SelectQueryBuilder<T> {
    filters.forEach((filter, index) => {
      const paramName = `filter_${index}`;
      let condition: string;
      const parameters: Record<string, any> = {};

      switch (filter.operator) {
        case 'eq':
          condition = `${filter.field} = :${paramName}`;
          parameters[paramName] = filter.value;
          break;
        case 'ne':
          condition = `${filter.field} != :${paramName}`;
          parameters[paramName] = filter.value;
          break;
        case 'gt':
          condition = `${filter.field} > :${paramName}`;
          parameters[paramName] = filter.value;
          break;
        case 'gte':
          condition = `${filter.field} >= :${paramName}`;
          parameters[paramName] = filter.value;
          break;
        case 'lt':
          condition = `${filter.field} < :${paramName}`;
          parameters[paramName] = filter.value;
          break;
        case 'lte':
          condition = `${filter.field} <= :${paramName}`;
          parameters[paramName] = filter.value;
          break;
        case 'like':
          condition = `${filter.field} LIKE :${paramName}`;
          parameters[paramName] = `%${filter.value}%`;
          break;
        case 'in':
          condition = `${filter.field} IN (:...${paramName})`;
          parameters[paramName] = Array.isArray(filter.value) ? filter.value : [filter.value];
          break;
        case 'notIn':
          condition = `${filter.field} NOT IN (:...${paramName})`;
          parameters[paramName] = Array.isArray(filter.value) ? filter.value : [filter.value];
          break;
        default:
          return;
      }

      queryBuilder.andWhere(condition, parameters);
    });

    return queryBuilder;
  }

  /**
   * 应用完整查询配置
   * @param queryBuilder 查询构建器
   * @param queryDto 查询 DTO
   * @param searchFields 搜索字段
   * @param dateField 日期字段
   * @returns 查询构建器
   */
  static applyQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    queryDto: QueryDto,
    searchFields: string[] = [],
    dateField: string = 'createdAt',
  ): SelectQueryBuilder<T> {
    // 应用关键词搜索
    if (queryDto.keyword && searchFields.length > 0) {
      this.applyKeywordSearch(queryBuilder, queryDto.keyword, searchFields);
    }

    // 应用日期范围
    if (queryDto.startDate || queryDto.endDate) {
      this.applyDateRange(queryBuilder, dateField, queryDto.startDate, queryDto.endDate);
    }

    // 应用排序
    this.applySort(queryBuilder, queryDto.sortBy, queryDto.sortOrder, dateField);

    // 应用分页
    this.applyPagination(queryBuilder, queryDto);

    return queryBuilder;
  }
}
