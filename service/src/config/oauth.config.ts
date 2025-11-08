import { registerAs } from '@nestjs/config';

/**
 * OAuth 配置
 */
export default registerAs('oauth', () => ({
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3005/api/v1/auth/github/callback',
  },
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
    callbackURL: process.env.WECHAT_CALLBACK_URL || 'http://localhost:3005/api/v1/auth/wechat/callback',
  },
}));

