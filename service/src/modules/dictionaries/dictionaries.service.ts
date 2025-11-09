import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, FindOptionsWhere } from 'typeorm';
import { Dictionary, DictionaryType, DictionaryStatus } from './entities/dictionary.entity';
import { CreateDictionaryDto } from './dto/create-dictionary.dto';
import { UpdateDictionaryDto } from './dto/update-dictionary.dto';
import { QueryDictionaryDto, GetOptionsDto } from './dto/query-dictionary.dto';
import { PaginationResponseDto } from '@/common/dto/pagination.dto';

@Injectable()
export class DictionariesService {
  constructor(
    @InjectRepository(Dictionary)
    private dictionaryRepository: Repository<Dictionary>,
  ) {}

  async create(createDictionaryDto: CreateDictionaryDto): Promise<Dictionary> {
    // 检查 (code, value) 组合是否唯一
    const where: FindOptionsWhere<Dictionary> = {
      code: createDictionaryDto.code,
    };
    if (createDictionaryDto.value) {
      where.value = createDictionaryDto.value;
    } else {
      where.value = IsNull();
    }
    const existing = await this.dictionaryRepository.findOne({ where });
    if (existing) {
      throw new BadRequestException('字典编码和值的组合已存在');
    }

    // 检查父字典是否存在
    if (createDictionaryDto.parentId) {
      const parent = await this.dictionaryRepository.findOne({
        where: { id: createDictionaryDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('父字典不存在');
      }
    }

    const dictionary = this.dictionaryRepository.create(createDictionaryDto);
    return await this.dictionaryRepository.save(dictionary);
  }

  /**
   * 查询字典列表（支持分页、搜索、过滤）
   * 使用 QueryBuilder 支持复杂的查询条件
   */
  async findAll(queryDto: QueryDictionaryDto): Promise<PaginationResponseDto<Dictionary>> {
    const {
      keyword,
      code,
      codes,
      type,
      types,
      status,
      statuses,
      parentId,
      parentIds,
      rootOnly,
      includeChildren,
      maxDepth,
      minDepth,
      value,
      valueLike,
      values,
      label,
      labelLike,
      descriptionLike,
      extraKey,
      extraValue,
      extraPath,
      isSystem,
      ids,
      createdAtFrom,
      createdAtTo,
      updatedAtFrom,
      updatedAtTo,
      includeDeleted,
      includeParent,
      includeChildrenRelation,
      sortBy,
      sortOrder,
      skip,
      take,
    } = queryDto;

    // 创建 QueryBuilder
    const queryBuilder = this.dictionaryRepository.createQueryBuilder('dict');

    // 处理软删除
    if (!includeDeleted) {
      queryBuilder.andWhere('dict.deletedAt IS NULL');
    }

    // 关键词搜索（名称、编码、标签、描述）
    if (keyword) {
      queryBuilder.andWhere(
        '(dict.name LIKE :keyword OR dict.code LIKE :keyword OR dict.label LIKE :keyword OR dict.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 编码查询
    if (code) {
      queryBuilder.andWhere('dict.code = :code', { code });
    }
    if (codes && codes.length > 0) {
      queryBuilder.andWhere('dict.code IN (:...codes)', { codes });
    }

    // 类型查询
    if (type) {
      queryBuilder.andWhere('dict.type = :type', { type });
    }
    if (types && types.length > 0) {
      queryBuilder.andWhere('dict.type IN (:...types)', { types });
    }

    // 状态查询
    if (status) {
      queryBuilder.andWhere('dict.status = :status', { status });
    }
    if (statuses && statuses.length > 0) {
      queryBuilder.andWhere('dict.status IN (:...statuses)', { statuses });
    }

    // 父节点查询
    if (rootOnly) {
      queryBuilder.andWhere('dict.parentId IS NULL');
    } else if (parentId !== undefined) {
      if (parentId === null) {
        queryBuilder.andWhere('dict.parentId IS NULL');
      } else {
        queryBuilder.andWhere('dict.parentId = :parentId', { parentId });
      }
    }
    if (parentIds && parentIds.length > 0) {
      queryBuilder.andWhere('dict.parentId IN (:...parentIds)', { parentIds });
    }

    // 值查询
    if (value) {
      queryBuilder.andWhere('dict.value = :value', { value });
    }
    if (valueLike) {
      queryBuilder.andWhere('dict.value LIKE :valueLike', { valueLike: `%${valueLike}%` });
    }
    if (values && values.length > 0) {
      queryBuilder.andWhere('dict.value IN (:...values)', { values });
    }

    // 标签查询
    if (label) {
      queryBuilder.andWhere('dict.label = :label', { label });
    }
    if (labelLike) {
      queryBuilder.andWhere('dict.label LIKE :labelLike', { labelLike: `%${labelLike}%` });
    }

    // 描述查询
    if (descriptionLike) {
      queryBuilder.andWhere('dict.description LIKE :descriptionLike', {
        descriptionLike: `%${descriptionLike}%`,
      });
    }

    // 扩展字段 JSON 查询
    if (extraKey && extraValue) {
      queryBuilder.andWhere(`dict.extra->>:extraKey = :extraValue`, {
        extraKey,
        extraValue: JSON.stringify(extraValue),
      });
    } else if (extraKey) {
      queryBuilder.andWhere(`dict.extra ? :extraKey`, { extraKey });
    }
    if (extraPath) {
      // 支持 PostgreSQL JSONB 路径查询
      queryBuilder.andWhere(`dict.extra #> :extraPath IS NOT NULL`, { extraPath });
    }

    // 系统字典查询
    if (isSystem !== undefined) {
      queryBuilder.andWhere('dict.isSystem = :isSystem', { isSystem });
    }

    // ID 列表查询
    if (ids && ids.length > 0) {
      queryBuilder.andWhere('dict.id IN (:...ids)', { ids });
    }

    // 日期范围查询
    if (createdAtFrom) {
      queryBuilder.andWhere('dict.createdAt >= :createdAtFrom', { createdAtFrom });
    }
    if (createdAtTo) {
      queryBuilder.andWhere('dict.createdAt <= :createdAtTo', { createdAtTo });
    }
    if (updatedAtFrom) {
      queryBuilder.andWhere('dict.updatedAt >= :updatedAtFrom', { updatedAtFrom });
    }
    if (updatedAtTo) {
      queryBuilder.andWhere('dict.updatedAt <= :updatedAtTo', { updatedAtTo });
    }

    // 关联查询
    if (includeParent) {
      queryBuilder.leftJoinAndSelect('dict.parent', 'parent');
    }
    if (includeChildrenRelation) {
      queryBuilder.leftJoinAndSelect('dict.children', 'children');
    }

    // 排序
    const orderBy = sortBy || 'sortOrder';
    const orderDirection = sortOrder || 'ASC';
    queryBuilder.orderBy(`dict.${orderBy}`, orderDirection);

    // 如果指定了排序字段，添加额外的排序字段以确保结果稳定
    if (orderBy !== 'createdAt') {
      queryBuilder.addOrderBy('dict.createdAt', 'ASC');
    }

    // 分页
    if (skip !== undefined) {
      queryBuilder.skip(skip);
    }
    if (take !== undefined) {
      queryBuilder.take(take);
    }

    // 执行查询
    const [items, total] = await queryBuilder.getManyAndCount();

    // 处理树形结构的深度和包含子节点
    let resultItems = items;
    if (includeChildren && (maxDepth !== undefined || minDepth !== undefined)) {
      resultItems = await this.filterByDepth(resultItems, minDepth, maxDepth);
    } else if (includeChildren) {
      // 如果只需要包含子节点，递归加载
      resultItems = await this.loadChildrenRecursively(resultItems);
    }

    return new PaginationResponseDto(resultItems, total, queryDto.page || 1, take);
  }

  /**
   * 根据深度过滤字典（树形结构）
   */
  private async filterByDepth(
    items: Dictionary[],
    minDepth?: number,
    maxDepth?: number,
  ): Promise<Dictionary[]> {
    const result: Dictionary[] = [];

    const calculateDepth = async (dict: Dictionary, currentDepth: number = 0): Promise<number> => {
      if (!dict.parentId) {
        return currentDepth;
      }
      const parent = await this.dictionaryRepository.findOne({
        where: { id: dict.parentId },
      });
      if (!parent) {
        return currentDepth;
      }
      return calculateDepth(parent, currentDepth + 1);
    };

    for (const item of items) {
      const depth = await calculateDepth(item);
      if (minDepth !== undefined && depth < minDepth) {
        continue;
      }
      if (maxDepth !== undefined && maxDepth > 0 && depth > maxDepth) {
        continue;
      }
      result.push(item);
    }

    return result;
  }

  /**
   * 递归加载子节点
   */
  private async loadChildrenRecursively(dictionaries: Dictionary[]): Promise<Dictionary[]> {
    const loadChildren = async (dict: Dictionary): Promise<void> => {
      const children = await this.dictionaryRepository.find({
        where: { parentId: dict.id },
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });
      dict.children = children;
      for (const child of children) {
        await loadChildren(child);
      }
    };

    for (const dict of dictionaries) {
      await loadChildren(dict);
    }

    return dictionaries;
  }

  /**
   * 获取所有字典（扁平列表，不分页）
   */
  async findAllFlat(): Promise<Dictionary[]> {
    return await this.dictionaryRepository.find({
      where: {},
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * 获取树形结构的字典列表
   */
  async findTree(code?: string): Promise<Dictionary[]> {
    const where: any = { parentId: IsNull() };
    if (code) {
      where.code = code;
    }

    const dictionaries = await this.dictionaryRepository.find({
      where,
      relations: ['children'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    // 递归加载子字典
    const loadChildren = async (dict: Dictionary) => {
      const children = await this.dictionaryRepository.find({
        where: { parentId: dict.id },
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });
      dict.children = children;
      for (const child of children) {
        await loadChildren(child);
      }
    };

    for (const dict of dictionaries) {
      await loadChildren(dict);
    }

    return dictionaries;
  }

  /**
   * 根据编码获取字典（扁平列表或树形结构）
   * @param code 字典编码
   * @param format 返回格式：tree 或 dict
   */
  async findByCode(
    code: string,
    format: 'tree' | 'dict' = 'dict',
  ): Promise<Dictionary[] | Record<string, any>> {
    const dictionaries = await this.dictionaryRepository.find({
      where: { code },
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    if (dictionaries.length === 0) {
      return format === 'tree' ? [] : {};
    }

    if (format === 'tree') {
      // 返回树形结构
      const rootDicts = dictionaries.filter((d) => !d.parentId);
      const buildTree = (parentId: string | null): Dictionary[] => {
        return dictionaries
          .filter((d) => d.parentId === parentId)
          .map((dict) => ({
            ...dict,
            children: buildTree(dict.id),
          }));
      };
      return rootDicts.map((dict) => ({
        ...dict,
        children: buildTree(dict.id),
      }));
    } else {
      // 返回字典格式 { value: label }
      const result: Record<string, any> = {};
      dictionaries.forEach((dict) => {
        const key = dict.value || dict.id;
        result[key] = {
          label: dict.label || dict.name,
          value: dict.value || dict.id,
          ...(dict.extra || {}),
        };
      });
      return result;
    }
  }

  /**
   * 获取选项列表（用于下拉单选/多选）
   * @param queryDto 查询参数
   * @returns 选项数组 [{label, value, ...extra}]
   */
  async getOptions(queryDto: GetOptionsDto): Promise<Array<Record<string, any>>> {
    const {
      code,
      parentId,
      enabledOnly = true,
      labelField = 'label',
      valueField = 'value',
    } = queryDto;

    const where: FindOptionsWhere<Dictionary> = {};

    if (code) {
      where.code = code;
    }
    if (parentId !== undefined) {
      where.parentId = parentId === null ? IsNull() : parentId;
    }
    if (enabledOnly) {
      where.status = DictionaryStatus.ENABLED;
    }

    const dictionaries = await this.dictionaryRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    return dictionaries.map((dict) => {
      const label =
        labelField === 'label'
          ? dict.label
          : labelField === 'name'
            ? dict.name
            : dict.label || dict.name;
      const value =
        valueField === 'value' ? dict.value : valueField === 'id' ? dict.id : dict.value || dict.id;
      return {
        label,
        value,
        id: dict.id,
        code: dict.code,
        ...(dict.extra || {}),
      };
    });
  }

  /**
   * 获取树形选项（用于级联选择器）
   * @param queryDto 查询参数
   * @returns 树形结构数组
   */
  async getTreeOptions(queryDto: GetOptionsDto): Promise<Array<Record<string, any>>> {
    const {
      code,
      parentId,
      enabledOnly = true,
      labelField = 'label',
      valueField = 'value',
    } = queryDto;

    const where: FindOptionsWhere<Dictionary> = {};

    if (code) {
      where.code = code;
    }
    if (parentId !== undefined) {
      where.parentId = parentId === null ? IsNull() : parentId;
    } else {
      // 默认只返回根节点
      where.parentId = IsNull();
    }
    if (enabledOnly) {
      where.status = DictionaryStatus.ENABLED;
    }

    const dictionaries = await this.dictionaryRepository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    // 递归加载子节点
    const loadChildren = async (parentId: string): Promise<any[]> => {
      const childWhere: FindOptionsWhere<Dictionary> = { parentId };
      if (code) {
        childWhere.code = code;
      }
      if (enabledOnly) {
        childWhere.status = DictionaryStatus.ENABLED;
      }

      const children = await this.dictionaryRepository.find({
        where: childWhere,
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });

      return Promise.all(
        children.map(async (child) => {
          const label =
            labelField === 'label'
              ? child.label
              : labelField === 'name'
                ? child.name
                : child.label || child.name;
          const value =
            valueField === 'value'
              ? child.value
              : valueField === 'id'
                ? child.id
                : child.value || child.id;
          return {
            label,
            value,
            id: child.id,
            code: child.code,
            ...(child.extra || {}),
            children: await loadChildren(child.id),
          };
        }),
      );
    };

    return Promise.all(
      dictionaries.map(async (dict) => {
        const label =
          labelField === 'label'
            ? dict.label
            : labelField === 'name'
              ? dict.name
              : dict.label || dict.name;
        const value =
          valueField === 'value'
            ? dict.value
            : valueField === 'id'
              ? dict.id
              : dict.value || dict.id;
        return {
          label,
          value,
          id: dict.id,
          code: dict.code,
          ...(dict.extra || {}),
          children: await loadChildren(dict.id),
        };
      }),
    );
  }

  /**
   * 获取所有字典（按编码分组）
   */
  async findAllByType(type?: DictionaryType): Promise<Record<string, Dictionary[]>> {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    const dictionaries = await this.dictionaryRepository.find({
      where,
      order: { code: 'ASC', sortOrder: 'ASC', createdAt: 'ASC' },
    });

    const grouped: Record<string, Dictionary[]> = {};
    dictionaries.forEach((dict) => {
      if (!grouped[dict.code]) {
        grouped[dict.code] = [];
      }
      grouped[dict.code].push(dict);
    });

    return grouped;
  }

  /**
   * 获取字典详情
   */
  async findOne(id: string): Promise<Dictionary> {
    const dictionary = await this.dictionaryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!dictionary) {
      throw new NotFoundException('字典不存在');
    }
    return dictionary;
  }

  /**
   * 更新字典
   */
  async update(id: string, updateDictionaryDto: UpdateDictionaryDto): Promise<Dictionary> {
    const dictionary = await this.findOne(id);

    // 检查 (code, value) 组合是否唯一（排除自己）
    const newCode = updateDictionaryDto.code || dictionary.code;
    const newValue =
      updateDictionaryDto.value !== undefined ? updateDictionaryDto.value : dictionary.value;

    if (updateDictionaryDto.code || updateDictionaryDto.value !== undefined) {
      const where: FindOptionsWhere<Dictionary> = { code: newCode };
      if (newValue) {
        where.value = newValue;
      } else {
        where.value = IsNull();
      }
      const existing = await this.dictionaryRepository.findOne({ where });
      if (existing && existing.id !== id) {
        throw new BadRequestException('字典编码和值的组合已存在');
      }
    }

    // 检查父字典是否存在且不能是自己
    if (updateDictionaryDto.parentId !== undefined) {
      if (updateDictionaryDto.parentId === id) {
        throw new BadRequestException('不能将自己设为父字典');
      }
      if (updateDictionaryDto.parentId) {
        const parent = await this.dictionaryRepository.findOne({
          where: { id: updateDictionaryDto.parentId },
        });
        if (!parent) {
          throw new NotFoundException('父字典不存在');
        }
      }
    }

    Object.assign(dictionary, updateDictionaryDto);
    return await this.dictionaryRepository.save(dictionary);
  }

  /**
   * 删除字典
   */
  async remove(id: string): Promise<void> {
    const dictionary = await this.findOne(id);

    // 系统字典不可删除
    if (dictionary.isSystem) {
      throw new BadRequestException('系统字典不可删除');
    }

    // 检查是否有子字典
    const children = await this.dictionaryRepository.find({
      where: { parentId: id },
    });
    if (children.length > 0) {
      throw new BadRequestException('存在子字典，无法删除');
    }

    await this.dictionaryRepository.remove(dictionary);
  }

  /**
   * 批量删除字典
   */
  async removeMany(ids: string[]): Promise<void> {
    const dictionaries = await this.dictionaryRepository.find({
      where: { id: In(ids) },
    });

    // 检查是否有系统字典
    const systemDicts = dictionaries.filter((d) => d.isSystem);
    if (systemDicts.length > 0) {
      throw new BadRequestException('包含系统字典，无法删除');
    }

    // 检查是否有子字典
    for (const dict of dictionaries) {
      const children = await this.dictionaryRepository.find({
        where: { parentId: dict.id },
      });
      if (children.length > 0) {
        throw new BadRequestException(`字典 ${dict.name} 存在子字典，无法删除`);
      }
    }

    await this.dictionaryRepository.remove(dictionaries);
  }

  /**
   * 批量查询字典（根据ID列表）
   */
  async findByIds(ids: string[], includeRelations = false): Promise<Dictionary[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const options: any = {
      where: { id: In(ids) },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    };

    if (includeRelations) {
      options.relations = ['parent', 'children'];
    }

    return await this.dictionaryRepository.find(options);
  }

  /**
   * 检查字典是否存在（根据code和value）
   */
  async existsByCodeAndValue(code: string, value: string | null): Promise<boolean> {
    const where: FindOptionsWhere<Dictionary> = { code };
    if (value) {
      where.value = value;
    } else {
      where.value = IsNull();
    }
    const count = await this.dictionaryRepository.count({ where });
    return count > 0;
  }

  /**
   * 统计字典数量（按条件分组）
   */
  async countByConditions(queryDto: Partial<QueryDictionaryDto>): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byCode: Record<string, number>;
  }> {
    const queryBuilder = this.dictionaryRepository.createQueryBuilder('dict');

    // 应用查询条件（复用findAll的逻辑）
    if (!queryDto.includeDeleted) {
      queryBuilder.andWhere('dict.deletedAt IS NULL');
    }

    if (queryDto.code) {
      queryBuilder.andWhere('dict.code = :code', { code: queryDto.code });
    }
    if (queryDto.codes && queryDto.codes.length > 0) {
      queryBuilder.andWhere('dict.code IN (:...codes)', { codes: queryDto.codes });
    }
    if (queryDto.type) {
      queryBuilder.andWhere('dict.type = :type', { type: queryDto.type });
    }
    if (queryDto.status) {
      queryBuilder.andWhere('dict.status = :status', { status: queryDto.status });
    }

    const total = await queryBuilder.getCount();

    // 按类型统计
    const byTypeQuery = this.dictionaryRepository
      .createQueryBuilder('dict')
      .select('dict.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('dict.type');
    if (!queryDto.includeDeleted) {
      byTypeQuery.andWhere('dict.deletedAt IS NULL');
    }
    const byTypeResult = await byTypeQuery.getRawMany();
    const byType: Record<string, number> = {};
    byTypeResult.forEach((row) => {
      byType[row.type] = parseInt(row.count, 10);
    });

    // 按状态统计
    const byStatusQuery = this.dictionaryRepository
      .createQueryBuilder('dict')
      .select('dict.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('dict.status');
    if (!queryDto.includeDeleted) {
      byStatusQuery.andWhere('dict.deletedAt IS NULL');
    }
    const byStatusResult = await byStatusQuery.getRawMany();
    const byStatus: Record<string, number> = {};
    byStatusResult.forEach((row) => {
      byStatus[row.status] = parseInt(row.count, 10);
    });

    // 按编码统计（前10个）
    const byCodeQuery = this.dictionaryRepository
      .createQueryBuilder('dict')
      .select('dict.code', 'code')
      .addSelect('COUNT(*)', 'count')
      .groupBy('dict.code')
      .orderBy('count', 'DESC')
      .limit(10);
    if (!queryDto.includeDeleted) {
      byCodeQuery.andWhere('dict.deletedAt IS NULL');
    }
    const byCodeResult = await byCodeQuery.getRawMany();
    const byCode: Record<string, number> = {};
    byCodeResult.forEach((row) => {
      byCode[row.code] = parseInt(row.count, 10);
    });

    return {
      total,
      byType,
      byStatus,
      byCode,
    };
  }

  /**
   * 获取字典的完整路径（从根节点到当前节点）
   */
  async getPath(id: string): Promise<Dictionary[]> {
    const dictionary = await this.findOne(id);
    const path: Dictionary[] = [dictionary];

    let current = dictionary;
    while (current.parentId) {
      const parent = await this.dictionaryRepository.findOne({
        where: { id: current.parentId },
      });
      if (!parent) {
        break;
      }
      path.unshift(parent);
      current = parent;
    }

    return path;
  }

  /**
   * 获取字典的所有子节点（扁平列表）
   */
  async getAllChildren(id: string): Promise<Dictionary[]> {
    const allChildren: Dictionary[] = [];

    const loadChildren = async (parentId: string): Promise<void> => {
      const children = await this.dictionaryRepository.find({
        where: { parentId },
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });
      allChildren.push(...children);
      for (const child of children) {
        await loadChildren(child.id);
      }
    };

    await loadChildren(id);
    return allChildren;
  }
}
