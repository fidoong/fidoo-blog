import {
  Controller,
  Post,
  Body,
  Get,
  Ip,
  HttpCode,
  HttpStatus,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';
import type { Response, Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Ip() ip: string) {
    return this.authService.login({ ...loginDto, ip });
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get('permissions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前用户权限列表' })
  async getPermissions(@CurrentUser() user: User) {
    const permissions = await this.usersService.getUserPermissions(user.id);
    return {
      code: 0,
      data: permissions,
      message: '获取成功',
    };
  }

  @Get('menus')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '获取当前用户菜单列表' })
  async getMenus(@CurrentUser() user: User) {
    const menus = await this.usersService.getUserMenus(user.id);
    return {
      code: 0,
      data: menus,
      message: '获取成功',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '用户登出' })
  async logout() {
    return {
      message: '登出成功',
    };
  }

  // ========== OAuth 授权 ==========

  @Public()
  @Get('github')
  @ApiOperation({ summary: 'GitHub OAuth 授权' })
  @ApiQuery({ name: 'redirect_uri', required: false, description: '前端回调地址' })
  @UseGuards(AuthGuard('github'))
  async githubAuth(@Res() res: Response) {
    const clientId = this.configService.get<string>('oauth.github.clientId');
    if (!clientId || clientId === 'placeholder') {
      return res.redirect(
        'http://localhost:3000/auth/callback?provider=github&error=config_missing',
      );
    }
    // Passport 会自动处理重定向到 GitHub
  }

  @Public()
  @Get('github/callback')
  @ApiOperation({ summary: 'GitHub OAuth 回调' })
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    if (!user) {
      return res.redirect(
        'http://localhost:3000/auth/callback?provider=github&error=authentication_failed',
      );
    }

    const loginResult = await this.authService.oauthLogin(user);
    const redirectUri =
      (req.query.redirect_uri as string) || 'http://localhost:3000/auth/callback?provider=github';

    // 重定向到前端，携带 token
    const url = new URL(redirectUri);
    url.searchParams.set('token', loginResult.accessToken);
    if (loginResult.refreshToken) {
      url.searchParams.set('refreshToken', loginResult.refreshToken);
    }

    res.redirect(url.toString());
  }

  @Public()
  @Get('wechat')
  @ApiOperation({ summary: '微信 OAuth 授权' })
  @ApiQuery({ name: 'redirect_uri', required: false, description: '前端回调地址' })
  async wechatAuth(@Query('redirect_uri') redirectUri: string, @Res() res: Response) {
    const appId = this.configService.get<string>('oauth.wechat.appId');
    const callbackURL = this.configService.get<string>('oauth.wechat.callbackURL');
    const finalRedirectUri = redirectUri || 'http://localhost:3000/auth/callback?provider=wechat';

    if (!appId || !callbackURL) {
      return res.redirect(
        'http://localhost:3000/auth/callback?provider=wechat&error=config_missing',
      );
    }

    // 构建微信授权 URL
    const wechatAuthUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${encodeURIComponent(callbackURL)}&response_type=code&scope=snsapi_login&state=${encodeURIComponent(finalRedirectUri)}#wechat_redirect`;

    res.redirect(wechatAuthUrl);
  }

  @Public()
  @Get('wechat/callback')
  @ApiOperation({ summary: '微信 OAuth 回调' })
  @UseGuards(AuthGuard('wechat'))
  async wechatCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    if (!user) {
      const state =
        (req.query.state as string) || 'http://localhost:3000/auth/callback?provider=wechat';
      return res.redirect(`${state}&error=authentication_failed`);
    }

    const loginResult = await this.authService.oauthLogin(user);
    const redirectUri =
      (req.query.state as string) || 'http://localhost:3000/auth/callback?provider=wechat';

    // 重定向到前端，携带 token
    const url = new URL(redirectUri);
    url.searchParams.set('token', loginResult.accessToken);
    if (loginResult.refreshToken) {
      url.searchParams.set('refreshToken', loginResult.refreshToken);
    }

    res.redirect(url.toString());
  }

  // 可选：前端使用 code 换取 token 的接口
  @Public()
  @Post('github/callback')
  @ApiOperation({ summary: 'GitHub OAuth 回调（前端使用 code 换取 token）' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
      },
    },
  })
  async githubCallbackCode(@Body('code') _code: string) {
    // 这里需要手动处理 code 换取 token 的逻辑
    // 由于 Passport 策略已经处理了大部分逻辑，这个接口主要用于前端直接调用
    // 实际实现可能需要调用 GitHub API
    throw new Error('此接口需要手动实现 GitHub code 换取 token 的逻辑');
  }

  @Public()
  @Post('wechat/callback')
  @ApiOperation({ summary: '微信 OAuth 回调（前端使用 code 换取 token）' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
      },
    },
  })
  async wechatCallbackCode(@Body('code') _code: string) {
    // 这里需要手动处理 code 换取 token 的逻辑
    // 实际实现可能需要调用微信 API
    throw new Error('此接口需要手动实现微信 code 换取 token 的逻辑');
  }
}
