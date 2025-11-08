import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<unknown> {
    // validateUser 内部已经处理了异常，这里直接返回即可
    // 如果 validateUser 抛出异常，会被自动捕获
    return await this.authService.validateUser(username, password);
  }
}
