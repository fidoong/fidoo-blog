import { Repository, FindOptionsWhere } from 'typeorm';
import { BaseEntity } from '@/database/base.entity';

/**
 * 基础 Repository 服务
 * 封装常用的数据库操作
 */
export class BaseRepositoryService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * 根据 ID 查找（不抛出异常）
   */
  async findByIdOrNull(id: string): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  /**
   * 根据条件查找一个（不抛出异常）
   */
  async findOneOrNull(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }

  /**
   * 根据条件查找多个
   */
  async findMany(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({ where });
  }

  /**
   * 检查是否存在
   */
  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  /**
   * 保存实体（创建或更新）
   */
  async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  /**
   * 批量保存
   */
  async saveMany(entities: T[]): Promise<T[]> {
    return this.repository.save(entities);
  }

  /**
   * 软删除
   */
  async softRemove(entity: T): Promise<T> {
    return this.repository.softRemove(entity);
  }

  /**
   * 物理删除
   */
  async remove(entity: T): Promise<T> {
    return this.repository.remove(entity);
  }

  /**
   * 更新
   */
  async update(id: string, partialEntity: Partial<T>): Promise<void> {
    await this.repository.update(id, partialEntity as any);
  }

  /**
   * 增量更新
   */
  async increment(where: FindOptionsWhere<T>, column: string, value: number): Promise<void> {
    await this.repository.increment(where, column, value);
  }

  /**
   * 减量更新
   */
  async decrement(where: FindOptionsWhere<T>, column: string, value: number): Promise<void> {
    await this.repository.decrement(where, column, value);
  }
}
