import { apiClient } from './client';
import type { SystemInfo, ProcessInfo, DashboardStats } from './types';

export const systemApi = {
  getSystemInfo: async (): Promise<SystemInfo> => {
    return apiClient.get<SystemInfo>('/system/info');
  },

  getProcessInfo: async (): Promise<ProcessInfo> => {
    return apiClient.get<ProcessInfo>('/system/process');
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/system/dashboard');
  },
};

