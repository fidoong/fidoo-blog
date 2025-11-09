/**
 * 定时消息监听组件
 * 监听 WebSocket 定时推送的消息并添加到通知列表
 */

'use client';

import { useEffect } from 'react';
import { App } from 'antd';
import { useWebSocketContext } from './WebSocketProvider';
import { useNotificationStore } from '@/store/notification';

interface ScheduledMessageData {
  type: string;
  title: string;
  content: string;
  timestamp: string;
  onlineUsers?: number;
}

export function ScheduledMessageListener() {
  const { connected, on, off } = useWebSocketContext();
  const { message: messageApi } = App.useApp();
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (!connected) {
      return;
    }

    // 监听定时推送消息
    const handleScheduledMessage = (data: ScheduledMessageData) => {
      // 添加到通知列表
      addNotification({
        type: data.type || 'scheduled',
        title: data.title || '定时通知',
        content: data.content,
        timestamp: data.timestamp,
        onlineUsers: data.onlineUsers,
      });

      // 显示一个轻量级的消息提示
      messageApi.info({
        content: data.content,
        duration: 3,
      });
    };

    // 注册事件监听
    on('scheduled-message', handleScheduledMessage);

    // 清理函数
    return () => {
      off('scheduled-message', handleScheduledMessage);
    };
  }, [connected, on, off, addNotification, messageApi]);

  // 这个组件不渲染任何内容
  return null;
}
