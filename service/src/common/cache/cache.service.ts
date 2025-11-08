import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * 缓存服务
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`获取缓存失败: ${key}`, error);
      return undefined;
    }
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl TTL（秒），默认 3600
   * @returns 是否成功
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      await this.cacheManager.set(key, value, ttl * 1000);
      return true;
    } catch (error) {
      this.logger.error(`设置缓存失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   * @returns 是否成功
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.cacheManager.del(key);
      return true;
    } catch (error) {
      this.logger.error(`删除缓存失败: ${key}`, error);
      return false;
    }
  }

  /**
   * 清空所有缓存
   * @returns 是否成功
   */
  async reset(): Promise<boolean> {
    try {
      await this.cacheManager.reset();
      return true;
    } catch (error) {
      this.logger.error('清空缓存失败', error);
      return false;
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }

  /**
   * 获取或设置缓存（如果不存在则设置）
   * @param key 缓存键
   * @param factory 值工厂函数
   * @param ttl TTL（秒）
   * @returns 缓存值
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    if (ttl !== undefined) {
      await this.set(key, value, ttl);
    } else {
      await this.set(key, value);
    }
    return value;
  }

  /**
   * 批量删除缓存（支持通配符）
   * @param pattern 模式（如 'user:*'）
   * @returns 删除的数量
   */
  async deleteByPattern(pattern: string): Promise<number> {
    // 注意：此功能需要根据使用的缓存实现来调整
    // Redis 支持 keys 命令，但内存缓存可能不支持
    this.logger.warn(`deleteByPattern 功能需要根据缓存实现来调整: ${pattern}`);
    return 0;
  }

  /**
   * 批量获取缓存
   * @param keys 缓存键数组
   * @returns 缓存值映射
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();
    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    }
    return result;
  }

  /**
   * 批量设置缓存
   * @param entries 键值对数组
   * @param ttl TTL（秒）
   * @returns 是否全部成功
   */
  async setMany(entries: Array<{ key: string; value: any }>, ttl: number = 3600): Promise<boolean> {
    try {
      await Promise.all(entries.map(({ key, value }) => this.set(key, value, ttl)));
      return true;
    } catch (error) {
      this.logger.error('批量设置缓存失败', error);
      return false;
    }
  }

  /**
   * 增加缓存值（仅适用于数字）
   * @param key 缓存键
   * @param increment 增量，默认为 1
   * @returns 增加后的值
   */
  async increment(key: string, increment: number = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + increment;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * 减少缓存值（仅适用于数字）
   * @param key 缓存键
   * @param decrement 减量，默认为 1
   * @returns 减少后的值
   */
  async decrement(key: string, decrement: number = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = Math.max(0, current - decrement);
    await this.set(key, newValue);
    return newValue;
  }
}
