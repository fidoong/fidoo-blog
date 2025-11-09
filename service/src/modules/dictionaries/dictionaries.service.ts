import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, Like, FindOptionsWhere } from 'typeorm';
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
   */
  async findAll(queryDto: QueryDictionaryDto): Promise<PaginationResponseDto<Dictionary>> {
    const { keyword, code, type, status, parentId, isSystem, sortBy, sortOrder, skip, take } =
      queryDto;

    const where: FindOptionsWhere<Dictionary> = {};

    if (code) {
      where.code = code;
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (parentId !== undefined) {
      where.parentId = parentId === null ? IsNull() : parentId;
    }
    if (isSystem !== undefined) {
      where.isSystem = isSystem;
    }

    // 关键词搜索（名称、编码、标签）
    if (keyword) {
      const keywordCondition = [
        { name: Like(`%${keyword}%`) },
        { code: Like(`%${keyword}%`) },
        { label: Like(`%${keyword}%`) },
      ];
      // 如果已有其他条件，需要组合查询
      if (Object.keys(where).length > 0) {
        // 使用 OR 条件组合
        const [items, total] = await this.dictionaryRepository.findAndCount({
          where: [
            { ...where, name: Like(`%${keyword}%`) },
            { ...where, code: Like(`%${keyword}%`) },
            { ...where, label: Like(`%${keyword}%`) },
          ],
          relations: ['parent', 'children'],
          order: { [sortBy || 'sortOrder']: sortOrder || 'ASC' },
          skip,
          take,
        });
        return new PaginationResponseDto(items, total, queryDto.page || 1, take);
      } else {
        const [items, total] = await this.dictionaryRepository.findAndCount({
          where: keywordCondition,
          relations: ['parent', 'children'],
          order: { [sortBy || 'sortOrder']: sortOrder || 'ASC' },
          skip,
          take,
        });
        return new PaginationResponseDto(items, total, queryDto.page || 1, take);
      }
    }

    const [items, total] = await this.dictionaryRepository.findAndCount({
      where,
      relations: ['parent', 'children'],
      order: { [sortBy || 'sortOrder']: sortOrder || 'ASC' },
      skip,
      take,
    });

    return new PaginationResponseDto(items, total, queryDto.page || 1, take);
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
}
