import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VERSION_METADATA } from './version.decorator';

/**
 * 版本守卫
 * 检查请求的 API 版本是否匹配
 */
@Injectable()
export class VersionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const controller = context.getClass();

    // 获取装饰器中的版本配置
    const versions = this.reflector.getAllAndOverride<string | string[]>(VERSION_METADATA, [
      handler,
      controller,
    ]);

    // 如果没有版本配置，允许通过
    if (!versions) {
      return true;
    }

    // 从请求头或查询参数获取版本
    const requestedVersion =
      request.headers['api-version'] ||
      request.headers['x-api-version'] ||
      request.query['version'] ||
      request.query['v'];

    // 标准化版本号（移除 'v' 前缀）
    const normalizeVersion = (v: string) => v.replace(/^v/i, '');

    const versionArray = Array.isArray(versions) ? versions : [versions];
    const normalizedVersions = versionArray.map(normalizeVersion);

    // 如果没有请求版本，使用默认版本（第一个）
    if (!requestedVersion) {
      request.version = normalizedVersions[0];
      return true;
    }

    const normalizedRequested = normalizeVersion(requestedVersion);

    // 检查版本是否匹配
    if (normalizedVersions.includes(normalizedRequested)) {
      request.version = normalizedRequested;
      return true;
    }

    throw new BadRequestException(
      `API version '${requestedVersion}' is not supported. Supported versions: ${versionArray.join(', ')}`,
    );
  }
}
