import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

interface GithubProfile {
  id: string;
  username?: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientId = configService.get<string>('oauth.github.clientId');
    const clientSecret = configService.get<string>('oauth.github.clientSecret');
    const callbackURL = configService.get<string>('oauth.github.callbackURL');

    // 如果配置不存在，使用占位符（避免策略初始化失败）
    // 实际使用时会在控制器中检查配置
    super({
      clientID: clientId || 'placeholder',
      clientSecret: clientSecret || 'placeholder',
      callbackURL: callbackURL || 'http://localhost:3005/api/v1/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GithubProfile,
  ): Promise<any> {
    const { id, username, displayName, emails, photos } = profile;
    const email = emails?.[0]?.value || `${id}@github.local`;
    const avatar = photos?.[0]?.value || undefined;

    // 使用 GitHub 信息创建或更新用户
    const user = await this.authService.findOrCreateOAuthUser({
      provider: 'github',
      providerId: id.toString(),
      email,
      username: username || `github_${id}`,
      nickname: displayName || username || `GitHub User ${id}`,
      avatar,
    });

    return user;
  }
}

