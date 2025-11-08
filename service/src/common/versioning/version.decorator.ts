import { SetMetadata } from '@nestjs/common';

export const VERSION_METADATA = 'version';

/**
 * API 版本装饰器
 * @param version 版本号，如 '1', '2', 'v1', 'v2'
 */
export const Version = (version: string | string[]) => SetMetadata(VERSION_METADATA, version);
