import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@/modules/users/entities/user.entity';
import { BusinessException } from '@/common';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw BusinessException.unauthorized('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw BusinessException.unauthorized('用户名或密码错误');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    // 更新最后登录时间
    await this.usersService.updateLastLogin(user.id, loginDto.ip);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('jwt.expiresIn'),
    };
  }

  async register(registerDto: RegisterDto) {
    // 检查用户名是否已存在
    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
      throw BusinessException.conflict('用户名已存在', { field: 'username' });
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw BusinessException.conflict('邮箱已被使用', { field: 'email' });
    }

    // 创建用户
    const user = await this.usersService.create(registerDto);

    // 自动登录
    return this.login({
      username: user.username,
      password: registerDto.password,
    });
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw BusinessException.unauthorized('用户不存在');
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return {
        accessToken,
        expiresIn: this.configService.get('jwt.expiresIn'),
      };
    } catch (error) {
      throw BusinessException.unauthorized('刷新令牌无效');
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      return await this.usersService.findById(payload.sub);
    } catch (error) {
      throw BusinessException.unauthorized('令牌无效');
    }
  }
}
