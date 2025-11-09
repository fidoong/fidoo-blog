/**
 * WebSocket Hook
 * 提供 WebSocket 连接管理功能
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';

export interface UseWebSocketOptions {
  /**
   * WebSocket 服务器地址
   */
  url?: string;
  /**
   * 是否自动连接
   */
  autoConnect?: boolean;
  /**
   * 连接成功回调
   */
  onConnect?: () => void;
  /**
   * 断开连接回调
   */
  onDisconnect?: () => void;
  /**
   * 错误回调
   */
  onError?: (error: Error) => void;
}

export interface UseWebSocketReturn {
  /**
   * Socket 实例
   */
  socket: Socket | null;
  /**
   * 是否已连接
   */
  connected: boolean;
  /**
   * 是否正在连接
   */
  connecting: boolean;
  /**
   * 连接错误
   */
  error: Error | null;
  /**
   * 手动连接
   */
  connect: () => void;
  /**
   * 手动断开连接
   */
  disconnect: () => void;
  /**
   * 发送消息
   */
  emit: (event: string, data?: any) => void;
  /**
   * 监听事件
   */
  on: (event: string, callback: (data: any) => void) => void;
  /**
   * 取消监听事件
   */
  off: (event: string, callback?: (data: any) => void) => void;
  /**
   * 加入房间
   */
  joinRoom: (room: string) => void;
  /**
   * 离开房间
   */
  leaveRoom: (room: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { url, autoConnect = true, onConnect, onDisconnect, onError } = options;

  const { accessToken } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 使用 ref 存储回调函数，避免依赖项变化导致重新连接
  const callbacksRef = useRef({ onConnect, onDisconnect, onError });
  useEffect(() => {
    callbacksRef.current = { onConnect, onDisconnect, onError };
  }, [onConnect, onDisconnect, onError]);

  // 使用 ref 存储连接状态，避免循环依赖
  const shouldConnectRef = useRef(false);
  const mountedRef = useRef(true);

  // 获取 WebSocket 服务器地址
  // 注意：Socket.IO 客户端可以使用 http:// 或 https://，会自动处理协议升级
  // 如果是生产环境使用 HTTPS，这里应该使用 https://
  const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3005';
  const wsNamespace = '/ws';

  // 连接 WebSocket
  const connect = useCallback(() => {
    // 如果已经连接或正在连接，直接返回
    if (socketRef.current?.connected || connecting) {
      return;
    }

    if (!accessToken) {
      console.warn('WebSocket: 未找到访问令牌，无法连接');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      // 如果已存在连接实例，先清理
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // 创建新的 Socket 连接
      // 确保 auth 对象正确传递
      const socket = io(`${wsUrl}${wsNamespace}`, {
        auth: accessToken
          ? {
              token: accessToken,
            }
          : {},
        extraHeaders: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
        forceNew: true, // 强制创建新连接，避免复用旧连接
      });

      // 调试日志
      console.log('WebSocket 连接配置:', {
        url: `${wsUrl}${wsNamespace}`,
        hasToken: !!accessToken,
        tokenPrefix: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
      });

      // 连接成功
      socket.on('connect', () => {
        console.log('WebSocket 连接成功');
        setConnected(true);
        setConnecting(false);
        setError(null);
        callbacksRef.current.onConnect?.();
      });

      // 连接错误（可能是临时错误，Socket.IO 会自动重试）
      socket.on('connect_error', (err: Error) => {
        // 只在开发环境显示详细错误，生产环境只记录
        if (process.env.NODE_ENV === 'development') {
          console.warn('WebSocket 连接尝试失败（将自动重试）:', err.message);
        }
        // 不立即设置错误状态，等待最终结果
      });

      // 所有重试都失败后触发
      socket.on('reconnect_failed', () => {
        const error = new Error('WebSocket 连接失败：所有重试均失败');
        console.error('WebSocket 连接失败:', error);
        setError(error);
        setConnecting(false);
        callbacksRef.current.onError?.(error);
      });

      // 断开连接
      socket.on('disconnect', (reason: string) => {
        console.log('WebSocket 断开连接:', reason);
        setConnected(false);
        setConnecting(false);
        // 只有在非主动断开的情况下才触发回调
        if (reason !== 'io client disconnect') {
          callbacksRef.current.onDisconnect?.();
        }
      });

      // 接收连接成功消息
      socket.on('connected', (data: any) => {
        console.log('WebSocket 连接确认:', data);
      });

      socketRef.current = socket;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('WebSocket 连接失败');
      setError(error);
      setConnecting(false);
      callbacksRef.current.onError?.(error);
    }
  }, [accessToken, wsUrl, connecting]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      // 移除所有监听器，避免触发 disconnect 事件
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setConnecting(false);
    }
  }, []);

  // 发送消息
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket 未连接，无法发送消息');
    }
  }, []);

  // 监听事件
  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // 取消监听事件
  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // 加入房间
  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-room', { room });
    } else {
      console.warn('WebSocket 未连接，无法加入房间');
    }
  }, []);

  // 离开房间
  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-room', { room });
    } else {
      console.warn('WebSocket 未连接，无法离开房间');
    }
  }, []);

  // 统一管理连接和断开
  useEffect(() => {
    mountedRef.current = true;

    // 如果不自动连接，直接返回
    if (!autoConnect) {
      return () => {
        mountedRef.current = false;
      };
    }

    // 如果没有 token，断开连接（如果存在）
    if (!accessToken) {
      if (socketRef.current) {
        disconnect();
      }
      return () => {
        mountedRef.current = false;
      };
    }

    // 如果有 token 且未连接，则连接
    if (accessToken && (!socketRef.current || !socketRef.current.connected)) {
      shouldConnectRef.current = true;
      
      // 延迟连接，避免在组件快速重新渲染时频繁连接
      const timer = setTimeout(() => {
        // 再次检查，确保在延迟期间没有发生变化且组件仍然挂载
        if (mountedRef.current && shouldConnectRef.current && accessToken && (!socketRef.current || !socketRef.current.connected)) {
          connect();
        }
      }, 100);

      return () => {
        shouldConnectRef.current = false;
        clearTimeout(timer);
        mountedRef.current = false;
      };
    }

    // 清理函数：只在组件卸载时断开连接
    return () => {
      mountedRef.current = false;
      // 组件卸载时断开连接
      if (socketRef.current) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, accessToken]); // 只依赖 autoConnect 和 accessToken

  return {
    socket: socketRef.current,
    connected,
    connecting,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
  };
}
