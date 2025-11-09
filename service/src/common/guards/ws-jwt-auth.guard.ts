/**
 * WebSocket JWT 认证守卫
 * 用于验证 WebSocket 连接中的 JWT token
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { UsersService } from '@/modules/users/users.service';
import { TokenBlacklistService } from '@/modules/auth/services/token-blacklist.service';
import { BusinessException } from '@/common';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  /**
   * 直接从 Socket 对象进行认证（用于 handleConnection）
   */
  async authenticateSocket(client: Socket): Promise<boolean> {
    const token = this.extractTokenFromSocket(client);

    // 调试日志（使用 log 级别确保能看到）
    this.logger.log('=== WebSocket 认证开始 ===');
    this.logger.log('handshake.auth 类型:', Array.isArray(client.handshake.auth) ? '数组' : typeof client.handshake.auth);
    this.logger.log('handshake.auth 内容:', JSON.stringify(client.handshake.auth || {}));
    this.logger.log('handshake.headers.authorization:', client.handshake.headers?.authorization || 'undefined');
    this.logger.log('提取的 token:', token ? `${token.substring(0, 20)}...` : 'null');

    if (!token) {
      this.logger.warn('WebSocket 认证失败: 未找到 token');
      throw new UnauthorizedException('Token not found');
    }

    try {
      // 验证 token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // 检查 token 是否在黑名单中
      const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);
      if (isBlacklisted) {
        throw BusinessException.unauthorized('errors.tokenRevoked');
      }

      // 检查用户是否被强制登出
      if (payload.iat) {
        const isUserBlacklisted = await this.tokenBlacklistService.isUserBlacklisted(
          payload.sub,
          payload.iat,
        );
        if (isUserBlacklisted) {
          throw BusinessException.unauthorized('errors.userForcedLogout');
        }
      }

      // 验证用户是否存在
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw BusinessException.unauthorized('errors.userNotFound');
      }

      // 检查用户状态
      if (user.status === 'banned' || user.status === 'inactive') {
        throw BusinessException.unauthorized('errors.userDisabled');
      }

      // 将用户信息附加到 socket 对象上
      client.data.user = user;
      client.data.userId = user.id;

      this.logger.log(`WebSocket 认证成功: 用户 ${user.username} (${user.id})`);
      return true;
    } catch (error) {
      this.logger.error('WebSocket 认证失败:', error);
      this.logger.error('错误类型:', error?.constructor?.name);
      this.logger.error('错误消息:', error?.message);

      // 如果是 UnauthorizedException，直接抛出
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // 如果是 BusinessException，转换为 UnauthorizedException
      if (error instanceof BusinessException) {
        throw new UnauthorizedException(error.message || 'Authentication failed');
      }

      // 其他错误，转换为 UnauthorizedException
      throw new UnauthorizedException('Invalid token');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    return this.authenticateSocket(client);
  }

  private extractTokenFromSocket(client: Socket): string | null {
    // 从 handshake auth 中获取 token
    // 处理多种可能的格式
    let token: string | null = null;

    // 方式1: 直接从 auth.token 获取
    if (client.handshake.auth?.token) {
      token = client.handshake.auth.token;
    }
    // 方式2: 如果 auth 是数组格式（某些情况下可能出现）
    else if (Array.isArray(client.handshake.auth)) {
      const authObj = client.handshake.auth[0];
      if (authObj && typeof authObj === 'object' && authObj.token) {
        token = authObj.token;
      }
    }
    // 方式3: 从 headers 中获取
    else if (client.handshake.headers?.authorization) {
      token = client.handshake.headers.authorization;
    }

    if (!token) {
      return null;
    }

    // 如果是 Bearer token，提取 token 部分
    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      return token.substring(7);
    }

    return token;
  }
}
