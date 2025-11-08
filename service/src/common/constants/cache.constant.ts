/**
 * 缓存相关常量
 */
export const CACHE_CONSTANTS = {
  // 默认 TTL（秒）
  DEFAULT_TTL: 3600, // 1小时

  // 缓存键前缀
  KEY_PREFIX: {
    USER: 'user:',
    POST: 'post:',
    CATEGORY: 'category:',
    TAG: 'tag:',
    COMMENT: 'comment:',
    SESSION: 'session:',
    TOKEN: 'token:',
  },

  // 缓存键
  KEYS: {
    USER_BY_ID: (id: string) => `user:${id}`,
    USER_BY_EMAIL: (email: string) => `user:email:${email}`,
    POST_BY_ID: (id: string) => `post:${id}`,
    POST_LIST: (page: number, pageSize: number) => `post:list:${page}:${pageSize}`,
    CATEGORY_LIST: 'category:list',
    TAG_LIST: 'tag:list',
  },
} as const;
