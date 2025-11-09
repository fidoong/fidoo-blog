import { apiClient } from './client';
import type { ApiResponse, SystemInfo, ProcessInfo, DashboardStats } from './types';

export const systemApi = {
  getSystemInfo: async (): Promise<ApiResponse<SystemInfo>> => {
    const response = await apiClient.get('/system/info');
    return response.data;
  },

  getProcessInfo: async (): Promise<ApiResponse<ProcessInfo>> => {
    const response = await apiClient.get('/system/process');
    return response.data;
  },

  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    // 这个接口可能需要后端实现，或者前端聚合多个接口
    // 暂时返回一个模拟响应
    const response = await apiClient.get('/system/dashboard');
    return response.data;
  },
};

