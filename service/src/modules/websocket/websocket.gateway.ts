/**
 * WebSocket 网关
 * 处理 WebSocket 连接、消息和房间管理
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UseFilters } from '@nestjs/common';
import { WsJwtAuthGuard } from '@/common/guards/ws-jwt-auth.guard';
import { WsExceptionFilter } from '@/common/filters/ws-exception.filter';
import { WebSocketService } from './websocket.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
    credentials: true,
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
@UseGuards(WsJwtAuthGuard)
@UseFilters(WsExceptionFilter)
export class AppWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppWebSocketGateway.name);

  constructor(
    private readonly websocketService: WebSocketService,
    private readonly wsJwtAuthGuard: WsJwtAuthGuard,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket 网关初始化完成');
    // 将服务器实例设置到服务中
    this.websocketService.setServer(server);

    // 监听连接错误
    server.on('connection', (socket: Socket) => {
      socket.on('error', (error: Error) => {
        this.logger.error(`Socket ${socket.id} 错误:`, error);
      });
    });
  }

  async handleConnection(client: Socket) {
    this.logger.log(`处理连接: ${client.id}`);

    // 手动调用守卫进行认证
    try {
      await this.wsJwtAuthGuard.authenticateSocket(client);
    } catch (error) {
      this.logger.warn(`客户端 ${client.id} 连接失败：认证失败`, error.message);

      // 发送错误消息给客户端
      try {
        client.emit('error', {
          message: error.message || '认证失败',
          code: 'AUTH_FAILED',
        });
      } catch (e) {
        this.logger.error('发送错误消息失败:', e);
      }

      client.disconnect();
      return;
    }

    const user = client.data.user;
    if (!user) {
      this.logger.warn(`客户端 ${client.id} 连接失败：未找到用户信息`);
      client.disconnect();
      return;
    }

    // 将用户加入个人房间
    const userRoom = `user:${user.id}`;
    await client.join(userRoom);

    // 将连接信息存储到服务中
    this.websocketService.addConnection(user.id, client.id);

    this.logger.log(`用户 ${user.username} (${user.id}) 已连接，Socket ID: ${client.id}`);
    this.logger.log(`当前在线用户数: ${this.websocketService.getOnlineUserCount()}`);

    // 发送连接成功消息
    client.emit('connected', {
      message: '连接成功',
      userId: user.id,
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (!user) {
      return;
    }

    // 从服务中移除连接信息
    this.websocketService.removeConnection(user.id, client.id);

    this.logger.log(`用户 ${user.username} (${user.id}) 已断开连接，Socket ID: ${client.id}`);
    this.logger.log(`当前在线用户数: ${this.websocketService.getOnlineUserCount()}`);
  }

  /**
   * 订阅消息事件
   */
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: unknown, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    this.logger.log(`收到来自用户 ${user?.username} 的消息: ${JSON.stringify(data)}`);

    // 广播消息给所有客户端
    this.server.emit('message', {
      from: user?.id,
      username: user?.username,
      message: data,
      timestamp: new Date().toISOString(),
    });

    return {
      event: 'message',
      data: {
        status: 'success',
        message: '消息已发送',
      },
    };
  }

  /**
   * 加入房间
   */
  @SubscribeMessage('join-room')
  async handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    const { room } = data;

    if (!room) {
      return {
        event: 'error',
        data: {
          status: 'error',
          message: '房间名称不能为空',
        },
      };
    }

    await client.join(room);
    this.logger.log(`用户 ${user?.username} 加入房间: ${room}`);

    // 通知房间内其他用户
    client.to(room).emit('user-joined', {
      userId: user?.id,
      username: user?.username,
      room,
      timestamp: new Date().toISOString(),
    });

    return {
      event: 'join-room',
      data: {
        status: 'success',
        message: `已加入房间: ${room}`,
        room,
      },
    };
  }

  /**
   * 离开房间
   */
  @SubscribeMessage('leave-room')
  async handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    const { room } = data;

    if (!room) {
      return {
        event: 'error',
        data: {
          status: 'error',
          message: '房间名称不能为空',
        },
      };
    }

    await client.leave(room);
    this.logger.log(`用户 ${user?.username} 离开房间: ${room}`);

    // 通知房间内其他用户
    client.to(room).emit('user-left', {
      userId: user?.id,
      username: user?.username,
      room,
      timestamp: new Date().toISOString(),
    });

    return {
      event: 'leave-room',
      data: {
        status: 'success',
        message: `已离开房间: ${room}`,
        room,
      },
    };
  }

  /**
   * 心跳检测
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() _client: Socket) {
    return {
      event: 'pong',
      data: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * 获取在线用户列表
   */
  @SubscribeMessage('get-online-users')
  handleGetOnlineUsers(@ConnectedSocket() _client: Socket) {
    const onlineUsers = this.websocketService.getOnlineUsers();
    return {
      event: 'online-users',
      data: {
        users: onlineUsers,
        count: onlineUsers.length,
      },
    };
  }
}
