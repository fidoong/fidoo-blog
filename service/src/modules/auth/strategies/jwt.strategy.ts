import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '@/modules/users/users.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { BusinessException } from '@/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
      passReqToCallback: true, // 传递 request 对象以获取原始 token
    });
  }

  async validate(
    req: Request,
    payload: { sub: string; username: string; role: string; iat?: number },
  ) {
    // 获取原始 token
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      throw BusinessException.unauthorized('Token 不存在');
    }

    // 检查 token 是否在黑名单中
    const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      throw BusinessException.unauthorized('Token 已被撤销');
    }

    // 检查用户是否被强制登出
    if (payload.iat) {
      const isUserBlacklisted = await this.tokenBlacklistService.isUserBlacklisted(
        payload.sub,
        payload.iat,
      );
      if (isUserBlacklisted) {
        throw BusinessException.unauthorized('用户已被强制登出，请重新登录');
      }
    }

    // 验证用户是否存在
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw BusinessException.unauthorized('用户不存在');
    }

    // 检查用户状态
    if (user.status === 'banned' || user.status === 'inactive') {
      throw BusinessException.unauthorized('用户已被禁用');
    }

    return user;
  }
}
