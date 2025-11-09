# WebSocket 使用指南

本文档介绍如何在 admin 前端和 NestJS 后端中使用 WebSocket 长连接功能。

## 架构概述

- **后端**: 使用 `@nestjs/websockets` 和 `socket.io` 实现 WebSocket 服务器
- **前端**: 使用 `socket.io-client` 连接 WebSocket 服务器
- **认证**: 通过 JWT token 进行 WebSocket 连接认证
- **命名空间**: `/ws`

## 后端使用

### 1. WebSocket 服务

`WebSocketService` 提供了管理 WebSocket 连接和发送消息的方法：

```typescript
import { WebSocketService } from '@/modules/websocket/websocket.service';

// 注入服务
constructor(private readonly websocketService: WebSocketService) {}

// 向指定用户发送消息
this.websocketService.sendToUser(userId, 'notification', {
  message: '您有一条新消息',
  timestamp: new Date().toISOString(),
});

// 向指定房间发送消息
this.websocketService.sendToRoom('room:123', 'message', {
  content: '房间消息',
});

// 广播消息给所有连接的客户端
this.websocketService.broadcast('system-notification', {
  message: '系统通知',
});

// 检查用户是否在线
const isOnline = this.websocketService.isUserOnline(userId);

// 获取在线用户数量
const count = this.websocketService.getOnlineUserCount();
```

### 2. WebSocket 网关事件

网关支持以下事件：

#### 客户端发送的事件

- `message`: 发送消息
- `join-room`: 加入房间
- `leave-room`: 离开房间
- `ping`: 心跳检测
- `get-online-users`: 获取在线用户列表

#### 服务器发送的事件

- `connected`: 连接成功确认
- `message`: 接收消息
- `user-joined`: 用户加入房间
- `user-left`: 用户离开房间
- `pong`: 心跳响应
- `online-users`: 在线用户列表

## 前端使用

### 1. 使用 WebSocket Hook

```typescript
'use client';

import { useWebSocketContext } from '@/components/websocket/WebSocketProvider';

export function MyComponent() {
  const { connected, emit, on, off } = useWebSocketContext();

  useEffect(() => {
    // 监听消息
    on('message', (data) => {
      console.log('收到消息:', data);
    });

    // 监听通知
    on('notification', (data) => {
      console.log('收到通知:', data);
    });

    // 清理
    return () => {
      off('message');
      off('notification');
    };
  }, [on, off]);

  const handleSendMessage = () => {
    emit('message', { content: 'Hello WebSocket!' });
  };

  return (
    <div>
      <p>连接状态: {connected ? '已连接' : '未连接'}</p>
      <button onClick={handleSendMessage}>发送消息</button>
    </div>
  );
}
```

### 2. 使用独立的 WebSocket Hook

如果不想使用全局上下文，可以直接使用 `useWebSocket` hook：

```typescript
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';

export function MyComponent() {
  const { connected, emit, on, off, joinRoom, leaveRoom } = useWebSocket({
    autoConnect: true,
    onConnect: () => {
      console.log('WebSocket 连接成功');
    },
    onDisconnect: () => {
      console.log('WebSocket 断开连接');
    },
  });

  useEffect(() => {
    // 加入房间
    if (connected) {
      joinRoom('room:123');
    }

    // 监听房间消息
    on('user-joined', (data) => {
      console.log('用户加入:', data);
    });

    return () => {
      leaveRoom('room:123');
      off('user-joined');
    };
  }, [connected, joinRoom, leaveRoom, on, off]);

  return <div>...</div>;
}
```

### 3. 房间管理

```typescript
const { joinRoom, leaveRoom, on, off } = useWebSocketContext();

// 加入房间
joinRoom('notifications');

// 监听房间事件
useEffect(() => {
  on('user-joined', (data) => {
    console.log('用户加入房间:', data);
  });

  on('user-left', (data) => {
    console.log('用户离开房间:', data);
  });

  return () => {
    off('user-joined');
    off('user-left');
  };
}, [on, off]);

// 离开房间
leaveRoom('notifications');
```

## 环境变量配置

### 前端 (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3005
NEXT_PUBLIC_WS_URL=http://localhost:3005
```

### 后端

WebSocket 服务会自动使用与 HTTP API 相同的端口。确保 CORS 配置允许前端域名。

## 认证

WebSocket 连接使用 JWT token 进行认证。token 会通过以下方式传递：

1. **前端**: 通过 `auth.token` 在连接时传递
2. **后端**: 从 `handshake.auth.token` 或 `handshake.headers.authorization` 中提取

如果 token 无效或过期，连接会被拒绝。

## 示例场景

### 1. 实时通知

```typescript
// 后端：发送通知
this.websocketService.sendToUser(userId, 'notification', {
  type: 'new-comment',
  message: '您收到了一条新评论',
  data: { commentId: '123' },
});

// 前端：接收通知
const { on } = useWebSocketContext();

useEffect(() => {
  on('notification', (data) => {
    if (data.type === 'new-comment') {
      message.info(data.message);
    }
  });

  return () => {
    off('notification');
  };
}, [on, off]);
```

### 2. 实时聊天

```typescript
// 加入聊天房间
joinRoom(`chat:${roomId}`);

// 发送消息
emit('message', {
  room: `chat:${roomId}`,
  content: 'Hello!',
});

// 接收消息
on('message', (data) => {
  if (data.room === `chat:${roomId}`) {
    // 显示消息
  }
});
```

### 3. 在线状态

```typescript
// 获取在线用户列表
emit('get-online-users');

// 接收在线用户列表
on('online-users', (data) => {
  console.log('在线用户:', data.users);
  console.log('在线人数:', data.count);
});
```

## 注意事项

1. **自动重连**: WebSocket 客户端配置了自动重连机制，连接断开时会自动尝试重连
2. **Token 刷新**: 当 token 刷新时，WebSocket 连接会自动重新建立
3. **性能**: 大量并发连接时，建议使用 Redis 适配器进行横向扩展
4. **安全性**: 确保在生产环境中使用 WSS (WebSocket Secure) 协议

## 故障排查

### 连接失败

1. 检查后端服务是否启动
2. 检查 CORS 配置是否正确
3. 检查 token 是否有效
4. 查看浏览器控制台和服务器日志

### 消息未收到

1. 确认事件名称是否正确
2. 检查是否已正确监听事件
3. 确认用户是否在线
4. 检查房间名称是否正确

## 扩展功能

### 使用 Redis 适配器（多服务器部署）

```typescript
// service/src/main.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

这样可以支持多服务器实例之间的消息同步。

