import { registerAs } from '@nestjs/config';

/**
 * 应用配置
 */
export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'Fidoo Blog',
  version: process.env.APP_VERSION || '1.0.0',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3005', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  rateLimit: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
  },
  cache: {
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10), // 5分钟
    longTTL: parseInt(process.env.CACHE_LONG_TTL || '3600', 10), // 1小时
    shortTTL: parseInt(process.env.CACHE_SHORT_TTL || '60', 10), // 1分钟
  },
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
}));
