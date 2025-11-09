/**
 * 清理 Token 黑名单服务
 * 用于开发环境清理 Redis 中的黑名单数据
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ClearBlacklistService {
  private readonly logger = new Logger(ClearBlacklistService.name);
  private readonly blacklistPrefix = 'token:blacklist:';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * 清理所有黑名单数据（仅用于开发环境）
   */
  async clearAllBlacklist(): Promise<number> {
    try {
      // 注意：这个方法需要 Redis 支持 KEYS 命令
      // 在生产环境中应该使用 SCAN 命令来避免阻塞
      this.logger.warn('⚠️  清理所有黑名单数据，仅用于开发环境');
      
      // 由于 cache-manager 的 API 限制，这里需要直接使用 Redis 客户端
      // 如果使用的是 Redis store，可以尝试获取底层客户端
      const store = (this.cacheManager as any).store;
      if (store && store.client) {
        const client = store.client;
        const keys = await client.keys(`${this.blacklistPrefix}*`);
        if (keys.length > 0) {
          await client.del(...keys);
          this.logger.log(`✅ 已清理 ${keys.length} 个黑名单条目`);
          return keys.length;
        }
      }
      
      this.logger.warn('无法访问 Redis 客户端，请手动清理 Redis 数据');
      return 0;
    } catch (error) {
      this.logger.error('清理黑名单失败', error);
      throw error;
    }
  }

  /**
   * 清理指定用户的黑名单数据
   */
  async clearUserBlacklist(userId: string): Promise<boolean> {
    try {
      const userKey = `${this.blacklistPrefix}user:${userId}`;
      await this.cacheManager.del(userKey);
      this.logger.log(`✅ 已清理用户 ${userId} 的黑名单数据`);
      return true;
    } catch (error) {
      this.logger.error('清理用户黑名单失败', error);
      return false;
    }
  }
}

