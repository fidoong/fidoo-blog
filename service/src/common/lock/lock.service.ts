import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * 分布式锁服务
 * 基于 Redis 实现分布式锁
 */
interface RedisClient {
  set(key: string, value: string, ...args: string[]): Promise<string | null>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  pexpire(key: string, ttl: number): Promise<number>;
}

@Injectable()
export class LockService implements OnModuleDestroy {
  private readonly logger = new Logger('LockService');
  private redis: RedisClient | null = null;
  private readonly defaultTtl = 30000; // 默认 30 秒

  constructor(private configService: ConfigService) {
    // 在实际应用中，应该注入 Redis 客户端
    // this.redis = redisClient;
  }

  /**
   * 获取锁
   * @param key 锁的键
   * @param ttl 锁的过期时间（毫秒）
   * @returns 是否成功获取锁
   */
  async acquire(key: string, ttl: number = this.defaultTtl): Promise<boolean> {
    if (!this.redis) {
      this.logger.warn('Redis client not initialized, lock operation skipped');
      return false;
    }

    try {
      const lockKey = `lock:${key}`;
      const lockValue = `${Date.now()}-${Math.random()}`;

      // 使用 SET NX EX 实现原子性加锁
      // SET lock:key value NX EX ttl
      const result = await this.redis.set(lockKey, lockValue, 'PX', String(ttl), 'NX');

      if (result === 'OK') {
        this.logger.debug(`Lock acquired: ${key}`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to acquire lock ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * 释放锁
   * @param key 锁的键
   */
  async release(key: string): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      const lockKey = `lock:${key}`;
      await this.redis.del(lockKey);
      this.logger.debug(`Lock released: ${key}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to release lock ${key}: ${errorMessage}`);
    }
  }

  /**
   * 尝试获取锁，如果失败则等待
   * @param key 锁的键
   * @param ttl 锁的过期时间（毫秒）
   * @param timeout 等待超时时间（毫秒）
   * @param interval 重试间隔（毫秒）
   */
  async tryLock(
    key: string,
    ttl: number = this.defaultTtl,
    timeout: number = 5000,
    interval: number = 100,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.acquire(key, ttl)) {
        return true;
      }

      await this.sleep(interval);
    }

    return false;
  }

  /**
   * 执行带锁的操作
   * @param key 锁的键
   * @param fn 要执行的函数
   * @param ttl 锁的过期时间（毫秒）
   */
  async withLock<T>(key: string, fn: () => Promise<T>, ttl: number = this.defaultTtl): Promise<T> {
    const acquired = await this.tryLock(key, ttl);

    if (!acquired) {
      throw new Error(`Failed to acquire lock: ${key}`);
    }

    try {
      return await fn();
    } finally {
      await this.release(key);
    }
  }

  /**
   * 检查锁是否存在
   */
  async isLocked(key: string): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const lockKey = `lock:${key}`;
      const result = await this.redis.exists(lockKey);
      return result === 1;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to check lock ${key}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * 延长锁的过期时间
   */
  async extend(key: string, ttl: number = this.defaultTtl): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      const lockKey = `lock:${key}`;
      const result = await this.redis.pexpire(lockKey, ttl);
      return result === 1;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to extend lock ${key}: ${errorMessage}`);
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onModuleDestroy() {
    // 清理资源
  }
}
