/**
 * 设备管理服务
 * 用于管理用户的登录设备
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { UserDevice } from '../entities/user-device.entity';
import { BusinessException } from '@/common';

export interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  deviceType?: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectRepository(UserDevice)
    private deviceRepository: Repository<UserDevice>,
  ) {}

  /**
   * 创建设备记录或更新现有设备
   * @param userId 用户 ID
   * @param deviceInfo 设备信息
   * @returns 设备记录
   */
  async createOrUpdateDevice(userId: string, deviceInfo: DeviceInfo): Promise<UserDevice> {
    let device = await this.deviceRepository.findOne({
      where: { userId, deviceId: deviceInfo.deviceId },
    });

    if (device) {
      // 更新现有设备
      device.lastActiveAt = new Date();
      device.lastLoginAt = new Date();
      device.loginCount += 1;
      device.isActive = true;
      if (deviceInfo.deviceName) device.deviceName = deviceInfo.deviceName;
      if (deviceInfo.deviceType) device.deviceType = deviceInfo.deviceType;
      if (deviceInfo.userAgent) device.userAgent = deviceInfo.userAgent;
      if (deviceInfo.ipAddress) device.ipAddress = deviceInfo.ipAddress;
    } else {
      // 创建新设备
      device = this.deviceRepository.create({
        userId,
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        lastActiveAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 1,
        isActive: true,
      });
    }

    return await this.deviceRepository.save(device);
  }

  /**
   * 更新设备活跃时间
   * @param userId 用户 ID
   * @param deviceId 设备 ID
   * @returns 是否成功
   */
  async updateLastActive(userId: string, deviceId: string): Promise<boolean> {
    try {
      await this.deviceRepository.update({ userId, deviceId }, { lastActiveAt: new Date() });
      return true;
    } catch (error) {
      this.logger.error('更新设备活跃时间失败', error);
      return false;
    }
  }

  /**
   * 获取用户的所有设备
   * @param userId 用户 ID
   * @returns 设备列表
   */
  async getUserDevices(userId: string): Promise<UserDevice[]> {
    return await this.deviceRepository.find({
      where: { userId },
      order: { lastActiveAt: 'DESC' },
    });
  }

  /**
   * 获取用户的活跃设备
   * @param userId 用户 ID
   * @returns 活跃设备列表
   */
  async getActiveDevices(userId: string): Promise<UserDevice[]> {
    return await this.deviceRepository.find({
      where: { userId, isActive: true },
      order: { lastActiveAt: 'DESC' },
    });
  }

  /**
   * 停用设备
   * @param userId 用户 ID
   * @param deviceId 设备 ID
   * @returns 是否成功
   */
  async deactivateDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      const result = await this.deviceRepository.update({ userId, deviceId }, { isActive: false });
      return result.affected !== undefined && result.affected > 0;
    } catch (error) {
      this.logger.error('停用设备失败', error);
      return false;
    }
  }

  /**
   * 删除设备
   * @param userId 用户 ID
   * @param deviceId 设备 ID
   * @returns 是否成功
   */
  async deleteDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      const result = await this.deviceRepository.delete({ userId, deviceId });
      return (result.affected ?? 0) > 0;
    } catch (error) {
      this.logger.error('删除设备失败', error);
      return false;
    }
  }

  /**
   * 删除用户的所有设备
   * @param userId 用户 ID
   * @returns 删除的数量
   */
  async deleteAllUserDevices(userId: string): Promise<number> {
    try {
      const result = await this.deviceRepository.delete({ userId });
      return result.affected || 0;
    } catch (error) {
      this.logger.error('删除用户所有设备失败', error);
      return 0;
    }
  }

  /**
   * 设置设备为信任设备
   * @param userId 用户 ID
   * @param deviceId 设备 ID
   * @param isTrusted 是否信任
   * @returns 是否成功
   */
  async setDeviceTrusted(userId: string, deviceId: string, isTrusted: boolean): Promise<boolean> {
    try {
      const result = await this.deviceRepository.update({ userId, deviceId }, { isTrusted });
      return result.affected !== undefined && result.affected > 0;
    } catch (error) {
      this.logger.error('设置设备信任状态失败', error);
      return false;
    }
  }

  /**
   * 生成设备 ID（基于用户代理和 IP）
   * @param userAgent 用户代理
   * @param ipAddress IP 地址
   * @returns 设备 ID
   */
  generateDeviceId(userAgent: string, ipAddress: string): string {
    const data = `${userAgent}:${ipAddress}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  /**
   * 解析设备信息
   * @param userAgent 用户代理字符串
   * @returns 设备信息
   */
  parseDeviceInfo(userAgent: string): { deviceName: string; deviceType: string } {
    const ua = userAgent.toLowerCase();
    let deviceType = 'unknown';
    let deviceName = userAgent.substring(0, 100); // 限制长度

    // 检测设备类型
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }

    // 检测浏览器
    if (ua.includes('chrome') && !ua.includes('edg')) {
      deviceName = `Chrome on ${deviceType}`;
    } else if (ua.includes('firefox')) {
      deviceName = `Firefox on ${deviceType}`;
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      deviceName = `Safari on ${deviceType}`;
    } else if (ua.includes('edg')) {
      deviceName = `Edge on ${deviceType}`;
    }

    return { deviceName, deviceType };
  }
}
