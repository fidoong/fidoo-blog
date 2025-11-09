/**
 * WebSocket 提供者组件
 * 为应用提供全局 WebSocket 连接
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket, UseWebSocketReturn } from '@/hooks/useWebSocket';
import { ScheduledMessageListener } from './ScheduledMessageListener';

interface WebSocketContextValue extends UseWebSocketReturn {}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  /**
   * WebSocket 服务器地址
   */
  url?: string;
  /**
   * 是否自动连接
   */
  autoConnect?: boolean;
}

export function WebSocketProvider({
  children,
  url,
  autoConnect = true,
}: WebSocketProviderProps) {
  const websocket = useWebSocket({
    url,
    autoConnect,
    onConnect: () => {
      console.log('WebSocket 全局连接成功');
    },
    onDisconnect: () => {
      console.log('WebSocket 全局连接断开');
    },
    onError: (error) => {
      console.error('WebSocket 全局连接错误:', error);
    },
  });

  return (
    <WebSocketContext.Provider value={websocket}>
      <ScheduledMessageListener />
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * 使用 WebSocket 上下文
 */
export function useWebSocketContext(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext 必须在 WebSocketProvider 内部使用');
  }
  return context;
}

