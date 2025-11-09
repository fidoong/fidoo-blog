import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import axios from 'axios';

@Injectable()
export class WechatStrategy extends PassportStrategy(Strategy, 'wechat') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super();
  }

  async validate(req: any): Promise<any> {
    const code = req.query.code;
    if (!code) {
      throw new Error('缺少授权码');
    }

    const appId = this.configService.get<string>('oauth.wechat.appId');
    const appSecret = this.configService.get<string>('oauth.wechat.appSecret');

    if (!appId || !appSecret) {
      throw new Error(
        '微信 OAuth 配置未设置，请在环境变量中配置 WECHAT_APP_ID 和 WECHAT_APP_SECRET',
      );
    }

    // 使用 code 换取 access_token
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${appSecret}&code=${code}&grant_type=authorization_code`;
    const tokenResponse = await axios.get(tokenUrl);
    const { access_token, openid } = tokenResponse.data;

    if (!access_token || !openid) {
      throw new Error('获取微信 access_token 失败');
    }

    // 使用 access_token 获取用户信息
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`;
    const userInfoResponse = await axios.get(userInfoUrl);
    const { nickname, headimgurl } = userInfoResponse.data;

    const email = `${openid}@wechat.local`;
    const username = `wechat_${openid}`;

    // 使用微信信息创建或更新用户
    const user = await this.authService.findOrCreateOAuthUser({
      provider: 'wechat',
      providerId: openid,
      email,
      username,
      nickname: nickname || `微信用户 ${openid}`,
      avatar: headimgurl || undefined,
    });

    return user;
  }
}
