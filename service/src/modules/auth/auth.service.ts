import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@/modules/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@/modules/users/entities/user.entity';
import { BusinessException } from '@/common';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { DeviceService, type DeviceInfo } from './services/device.service';
import { AuditLogsService } from '@/modules/audit-logs/audit-logs.service';
import { AnomalyDetectionService } from '@/modules/audit-logs/services/anomaly-detection.service';
import { AnomalyNotificationService } from '@/modules/audit-logs/services/anomaly-notification.service';
import {
  AuditAction,
  AuditStatus,
  AuditSeverity,
} from '@/modules/audit-logs/entities/audit-log.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
    private deviceService: DeviceService,
    private auditLogsService: AuditLogsService,
    private anomalyDetectionService: AnomalyDetectionService,
    private anomalyNotificationService: AnomalyNotificationService,
  ) {}

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw BusinessException.unauthorized('errors.usernameOrPasswordError');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw BusinessException.unauthorized('errors.usernameOrPasswordError');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto & { deviceInfo?: DeviceInfo; userAgent?: string }) {
    const startTime = Date.now();
    let loginStatus: AuditStatus = AuditStatus.SUCCESS;
    let errorMessage: string | undefined;

    try {
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

      // 创建设备记录
      if (loginDto.deviceInfo) {
        await this.deviceService.createOrUpdateDevice(user.id, loginDto.deviceInfo);
      }

      // 异常检测
      const deviceId = loginDto.deviceInfo?.deviceId || '';
      const userDevices = await this.deviceService.getUserDevices(user.id);
      const isNewDevice = !userDevices.some((d) => d.deviceId === deviceId);
      const anomalyResult = await this.anomalyDetectionService.detectLoginAnomaly(
        user.id,
        loginDto.ip || '',
        loginDto.userAgent || '',
        deviceId,
        isNewDevice,
      );

      // 记录审计日志
      await this.auditLogsService.create({
        userId: user.id,
        username: user.username,
        action: AuditAction.LOGIN,
        resource: 'Auth',
        ip: loginDto.ip,
        userAgent: loginDto.userAgent,
        deviceId,
        status: loginStatus,
        severity: anomalyResult.severity,
        duration: Date.now() - startTime,
        isAnomaly: anomalyResult.isAnomaly,
        anomalyReason: anomalyResult.reasons.join('; '),
        metadata: {
          deviceInfo: loginDto.deviceInfo,
          anomalyScore: anomalyResult.score,
        },
      });

      // 如果是异常登录，发送通知
      if (anomalyResult.isAnomaly) {
        await this.anomalyNotificationService.sendLoginAnomalyNotification(
          user.id,
          user.username,
          anomalyResult,
          loginDto.ip,
          loginDto.userAgent,
          {
            deviceInfo: loginDto.deviceInfo,
            anomalyScore: anomalyResult.score,
          },
        );
      }

      return {
        user,
        accessToken,
        refreshToken,
        expiresIn: this.configService.get('jwt.expiresIn'),
      };
    } catch (error) {
      loginStatus = AuditStatus.ERROR;
      errorMessage = error instanceof Error ? error.message : '登录失败';

      // 记录失败的登录尝试
      await this.auditLogsService.create({
        action: AuditAction.LOGIN,
        resource: 'Auth',
        ip: loginDto.ip,
        userAgent: loginDto.userAgent,
        status: loginStatus,
        severity: AuditSeverity.MEDIUM,
        duration: Date.now() - startTime,
        error: {
          message: errorMessage,
        },
        metadata: {
          username: loginDto.username,
        },
      });

      throw error;
    }
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

  /**
   * OAuth 登录：查找或创建用户
   */
  async findOrCreateOAuthUser(oauthData: {
    provider: 'github' | 'wechat';
    providerId: string;
    email: string;
    username: string;
    nickname?: string;
    avatar?: string;
  }): Promise<User> {
    // 先尝试通过邮箱查找用户
    let user = await this.usersService.findByEmail(oauthData.email);

    if (user) {
      // 用户已存在，更新头像和昵称（如果提供）
      if (oauthData.avatar && !user.avatar) {
        user.avatar = oauthData.avatar;
      }
      if (oauthData.nickname && !user.nickname) {
        user.nickname = oauthData.nickname;
      }
      // 使用 update 方法更新用户
      const updateData: any = {};
      if (user.avatar) {
        updateData.avatar = user.avatar;
      }
      if (user.nickname) {
        updateData.nickname = user.nickname;
      }
      if (Object.keys(updateData).length > 0) {
        return await this.usersService.update(user.id, updateData);
      }
      return user;
    }

    // 用户不存在，创建新用户
    // 生成一个随机密码（OAuth 用户不需要密码）
    const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-12), 10);

    const createData: any = {
      username: oauthData.username,
      email: oauthData.email,
      password: randomPassword,
    };
    if (oauthData.nickname) {
      createData.nickname = oauthData.nickname;
    }
    if (oauthData.avatar) {
      createData.avatar = oauthData.avatar;
    }
    user = await this.usersService.create(createData);

    return user;
  }

  /**
   * OAuth 登录成功后生成 token
   */
  async oauthLogin(user: User, deviceInfo?: DeviceInfo) {
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
    await this.usersService.updateLastLogin(user.id, 'oauth');

    // 创建设备记录
    if (deviceInfo) {
      await this.deviceService.createOrUpdateDevice(user.id, deviceInfo);
    }

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('jwt.expiresIn'),
    };
  }

  /**
   * 登出：将 token 加入黑名单
   */
  async logout(token: string, userId: string, ip?: string, userAgent?: string): Promise<void> {
    const startTime = Date.now();
    await this.tokenBlacklistService.addToBlacklist(token);

    // 记录审计日志
    const user = await this.usersService.findById(userId);
    await this.auditLogsService.create({
      userId,
      username: user?.username,
      action: AuditAction.LOGOUT,
      resource: 'Auth',
      ip,
      userAgent,
      status: AuditStatus.SUCCESS,
      duration: Date.now() - startTime,
    });
  }

  /**
   * 强制登出用户（撤销所有 token）
   */
  async forceLogout(userId: string, operatorId?: string, operatorUsername?: string): Promise<void> {
    const startTime = Date.now();
    await this.tokenBlacklistService.blacklistUserTokens(userId);

    // 记录审计日志
    const user = await this.usersService.findById(userId);
    await this.auditLogsService.create({
      userId: operatorId || userId,
      username: operatorUsername || user?.username,
      action: AuditAction.FORCE_LOGOUT,
      resource: 'Auth',
      resourceId: userId,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.HIGH,
      duration: Date.now() - startTime,
      metadata: {
        targetUserId: userId,
        targetUsername: user?.username,
      },
    });
  }
}
