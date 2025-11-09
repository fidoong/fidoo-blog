/**
 * 通知管理 API
 */

import { apiClient } from './client';
import type { PaginatedResponse } from './types';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryNotificationDto {
  page?: number;
  pageSize?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}

export const notificationsApi = {
  // 获取通知列表
  getNotifications: async (
    params?: QueryNotificationDto
  ): Promise<PaginatedResponse<Notification>> => {
    return apiClient.get<PaginatedResponse<Notification>>('/notifications', { params });
  },

  // 获取未读数量
  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiClient.get<{ count: number }>('/notifications/unread-count');
  },

  // 标记为已读
  markAsRead: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/notifications/${id}/read`);
  },

  // 全部标记为已读
  markAllAsRead: async (): Promise<void> => {
    return apiClient.post<void>('/notifications/read-all');
  },

  // 删除通知
  deleteNotification: async (id: string): Promise<void> => {
    return apiClient.post<void>(`/notifications/${id}/delete`);
  },
};
