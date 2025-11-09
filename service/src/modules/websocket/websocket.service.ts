/**
 * WebSocket 服务
 * 管理 WebSocket 连接和用户状态
 */

import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private readonly userConnections = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private server: Server | null = null;

  /**
   * 设置 Socket.IO 服务器实例
   */
  setServer(server: Server) {
    this.server = server;
  }

  /**
   * 添加用户连接
   */
  addConnection(userId: string, socketId: string): void {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(socketId);
    this.logger.debug(`用户 ${userId} 添加连接: ${socketId}`);
  }

  /**
   * 移除用户连接
   */
  removeConnection(userId: string, socketId: string): void {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(socketId);
      if (connections.size === 0) {
        this.userConnections.delete(userId);
      }
    }
    this.logger.debug(`用户 ${userId} 移除连接: ${socketId}`);
  }

  /**
   * 获取用户的所有连接
   */
  getConnections(userId: string): string[] {
    const connections = this.userConnections.get(userId);
    return connections ? Array.from(connections) : [];
  }

  /**
   * 检查用户是否在线
   */
  isUserOnline(userId: string): boolean {
    const connections = this.userConnections.get(userId);
    return connections ? connections.size > 0 : false;
  }

  /**
   * 获取在线用户数量
   */
  getOnlineUserCount(): number {
    return this.userConnections.size;
  }

  /**
   * 获取所有在线用户 ID
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userConnections.keys());
  }

  /**
   * 向指定用户发送消息
   */
  sendToUser(userId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.warn('Socket.IO 服务器未初始化');
      return;
    }

    const connections = this.getConnections(userId);
    if (connections.length === 0) {
      this.logger.debug(`用户 ${userId} 不在线，无法发送消息`);
      return;
    }

    // 向用户的所有连接发送消息
    connections.forEach((socketId) => {
      const socket = this.server!.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      }
    });

    this.logger.debug(`向用户 ${userId} 发送消息: ${event}`);
  }

  /**
   * 向指定房间发送消息
   */
  sendToRoom(room: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.warn('Socket.IO 服务器未初始化');
      return;
    }

    this.server.to(room).emit(event, data);
    this.logger.debug(`向房间 ${room} 发送消息: ${event}`);
  }

  /**
   * 广播消息给所有连接的客户端
   */
  broadcast(event: string, data: any): void {
    if (!this.server) {
      this.logger.warn('Socket.IO 服务器未初始化');
      return;
    }

    this.server.emit(event, data);
    this.logger.debug(`广播消息: ${event}`);
  }
}

