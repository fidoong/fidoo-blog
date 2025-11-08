import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';
export const CACHE_SKIP_METADATA = 'cache:skip';

/**
 * 缓存键装饰器
 * @param key 缓存键
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);

/**
 * 缓存 TTL 装饰器
 * @param ttl TTL（秒）
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

/**
 * 跳过缓存装饰器
 */
export const SkipCache = () => SetMetadata(CACHE_SKIP_METADATA, true);
