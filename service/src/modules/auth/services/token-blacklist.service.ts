/**
 * Token 黑名单服务
 * 用于管理被撤销的 JWT token
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly blacklistPrefix = 'token:blacklist:';

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 将 token 加入黑名单
   * @param token JWT token
   * @returns 是否成功
   */
  async addToBlacklist(token: string): Promise<boolean> {
    try {
      // 解析 token 获取过期时间
      const decoded = this.jwtService.decode(token) as { exp?: number; iat?: number } | null;
      if (!decoded || !decoded.exp) {
        this.logger.warn('无法解析 token，无法加入黑名单');
        return false;
      }

      // 计算剩余过期时间（秒）
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - now;

      // 如果 token 已过期，不需要加入黑名单
      if (ttl <= 0) {
        this.logger.debug('Token 已过期，无需加入黑名单');
        return true;
      }

      // 使用 token 的 jti（JWT ID）或整个 token 的 hash 作为 key
      const tokenKey = this.getTokenKey(token);
      await this.cacheManager.set(tokenKey, 'blacklisted', ttl * 1000);

      this.logger.debug(`Token 已加入黑名单: ${tokenKey}, TTL: ${ttl}秒`);
      return true;
    } catch (error) {
      this.logger.error('加入黑名单失败', error);
      return false;
    }
  }

  /**
   * 检查 token 是否在黑名单中
   * @param token JWT token
   * @returns 是否在黑名单中
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const tokenKey = this.getTokenKey(token);
      const value = await this.cacheManager.get<string>(tokenKey);
      return value === 'blacklisted';
    } catch (error) {
      this.logger.error('检查黑名单失败', error);
      // 出错时为了安全，返回 true（认为 token 已被拉黑）
      return true;
    }
  }

  /**
   * 从黑名单中移除 token（通常不需要，因为 token 会自然过期）
   * @param token JWT token
   * @returns 是否成功
   */
  async removeFromBlacklist(token: string): Promise<boolean> {
    try {
      const tokenKey = this.getTokenKey(token);
      await this.cacheManager.del(tokenKey);
      return true;
    } catch (error) {
      this.logger.error('从黑名单移除失败', error);
      return false;
    }
  }

  /**
   * 将用户的所有 token 加入黑名单（用于强制登出）
   * @param userId 用户 ID
   * @returns 是否成功
   */
  async blacklistUserTokens(userId: string): Promise<boolean> {
    try {
      // 使用用户 ID 作为标记，在验证时检查
      const userKey = `${this.blacklistPrefix}user:${userId}`;
      const ttl = this.configService.get<number>('jwt.expiresIn', 3600);
      await this.cacheManager.set(userKey, Date.now().toString(), ttl * 1000);
      this.logger.debug(`用户 ${userId} 的所有 token 已加入黑名单`);
      return true;
    } catch (error) {
      this.logger.error('将用户 token 加入黑名单失败', error);
      return false;
    }
  }

  /**
   * 检查用户是否被强制登出
   * @param userId 用户 ID
   * @param tokenIssuedAt token 签发时间
   * @returns 是否被强制登出
   */
  async isUserBlacklisted(userId: string, tokenIssuedAt: number): Promise<boolean> {
    try {
      const userKey = `${this.blacklistPrefix}user:${userId}`;
      const blacklistedAt = await this.cacheManager.get<string>(userKey);
      if (!blacklistedAt) {
        return false;
      }
      // 如果 token 的签发时间早于被拉黑的时间，则 token 无效
      return parseInt(blacklistedAt, 10) > tokenIssuedAt * 1000;
    } catch (error) {
      this.logger.error('检查用户黑名单失败', error);
      return true; // 为了安全，返回 true
    }
  }

  /**
   * 获取 token 的缓存键
   * @param token JWT token
   * @returns 缓存键
   */
  private getTokenKey(token: string): string {
    // 使用 token 的 hash 作为 key
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    return `${this.blacklistPrefix}${hash}`;
  }
}
