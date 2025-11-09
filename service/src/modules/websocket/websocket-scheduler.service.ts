/**
 * WebSocket 定时推送服务
 * 定时向所有连接的客户端推送消息
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WebSocketService } from './websocket.service';

@Injectable()
export class WebSocketSchedulerService {
  private readonly logger = new Logger(WebSocketSchedulerService.name);
  private messageCounter = 0;

  constructor(private readonly websocketService: WebSocketService) {}

  /**
   * 每30秒推送一次消息
   * Cron 表达式: 每30秒执行一次
   */
  @Cron('*/30 * * * * *')
  async sendScheduledMessage() {
    const onlineUserCount = this.websocketService.getOnlineUserCount();

    if (onlineUserCount === 0) {
      this.logger.debug('没有在线用户，跳过定时推送');
      return;
    }

    this.messageCounter += 1;

    const message = {
      type: 'scheduled-notification',
      title: '定时通知',
      content: `这是第 ${this.messageCounter} 条定时推送消息`,
      timestamp: new Date().toISOString(),
      onlineUsers: onlineUserCount,
    };

    // 广播消息给所有连接的客户端
    this.websocketService.broadcast('scheduled-message', message);

    this.logger.log(`定时推送消息 #${this.messageCounter}，在线用户数: ${onlineUserCount}`);
  }
}
