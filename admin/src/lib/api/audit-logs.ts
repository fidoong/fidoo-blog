/**
 * 审计日志 API
 */

import { apiClient } from './client';

export enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  TOKEN_REFRESH = 'token_refresh',
  FORCE_LOGOUT = 'force_logout',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  DEVICE_CREATE = 'device_create',
  DEVICE_DEACTIVATE = 'device_deactivate',
  DEVICE_DELETE = 'device_delete',
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_BAN = 'user_ban',
  USER_UNBAN = 'user_unban',
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
  ROLE_ASSIGN = 'role_assign',
  ROLE_REVOKE = 'role_revoke',
  POST_CREATE = 'post_create',
  POST_UPDATE = 'post_update',
  POST_DELETE = 'post_delete',
  POST_PUBLISH = 'post_publish',
  SETTINGS_UPDATE = 'settings_update',
  CONFIG_UPDATE = 'config_update',
}

export enum AuditStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AuditLog {
  id: string;
  userId?: string;
  username?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  status: AuditStatus;
  severity: AuditSeverity;
  isAnomaly: boolean;
  anomalyReason?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryAuditLogsDto {
  userId?: string;
  username?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  ip?: string;
  status?: AuditStatus;
  severity?: AuditSeverity;
  isAnomaly?: boolean;
  startTime?: Date | string;
  endTime?: Date | string;
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

export interface ActionStatsResponse {
  action: AuditAction;
  count: number;
}

export interface AnomaliesStatsResponse {
  count: number;
}

export interface CleanLogsResponse {
  message: string;
  deleted: number;
}

export const auditLogsApi = {
  // 查询审计日志
  getAuditLogs: async (params?: QueryAuditLogsDto): Promise<AuditLogsResponse> => {
    const queryParams: Record<string, unknown> = {};
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof QueryAuditLogsDto];
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            queryParams[key] = value.toISOString();
          } else {
            queryParams[key] = value;
          }
        }
      });
    }
    return apiClient.get<AuditLogsResponse>('/audit-logs', { params: queryParams });
  },

  // 查询异常日志
  getAnomalies: async (params?: {
    userId?: string;
    startTime?: Date | string;
    endTime?: Date | string;
    limit?: number;
  }): Promise<AuditLogsResponse> => {
    const queryParams: Record<string, unknown> = {};
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            queryParams[key] = value.toISOString();
          } else {
            queryParams[key] = value;
          }
        }
      });
    }
    return apiClient.get<AuditLogsResponse>('/audit-logs/anomalies', { params: queryParams });
  },

  // 查询用户操作历史
  getUserLogs: async (userId: string, limit?: number): Promise<AuditLog[]> => {
    return apiClient.get<AuditLog[]>(`/audit-logs/user/${userId}`, {
      params: limit ? { limit } : undefined,
    });
  },

  // 查询 IP 操作历史
  getIpLogs: async (ip: string, limit?: number): Promise<AuditLog[]> => {
    return apiClient.get<AuditLog[]>(`/audit-logs/ip/${ip}`, {
      params: limit ? { limit } : undefined,
    });
  },

  // 根据追踪 ID 查询日志
  getLogsByTraceId: async (traceId: string): Promise<AuditLog[]> => {
    return apiClient.get<AuditLog[]>(`/audit-logs/trace/${traceId}`);
  },

  // 统计操作数量
  getActionStats: async (
    action: AuditAction,
    params?: { startTime?: Date | string; endTime?: Date | string }
  ): Promise<ActionStatsResponse> => {
    const queryParams: Record<string, unknown> = {};
    if (params) {
      if (params.startTime) {
        queryParams.startTime =
          params.startTime instanceof Date ? params.startTime.toISOString() : params.startTime;
      }
      if (params.endTime) {
        queryParams.endTime =
          params.endTime instanceof Date ? params.endTime.toISOString() : params.endTime;
      }
    }
    return apiClient.get<ActionStatsResponse>(`/audit-logs/stats/action/${action}`, {
      params: queryParams,
    });
  },

  // 统计异常操作数量
  getAnomaliesStats: async (params?: {
    startTime?: Date | string;
    endTime?: Date | string;
  }): Promise<AnomaliesStatsResponse> => {
    const queryParams: Record<string, unknown> = {};
    if (params) {
      if (params.startTime) {
        queryParams.startTime =
          params.startTime instanceof Date ? params.startTime.toISOString() : params.startTime;
      }
      if (params.endTime) {
        queryParams.endTime =
          params.endTime instanceof Date ? params.endTime.toISOString() : params.endTime;
      }
    }
    return apiClient.get<AnomaliesStatsResponse>('/audit-logs/stats/anomalies', {
      params: queryParams,
    });
  },

  // 清理过期日志
  cleanOldLogs: async (daysToKeep?: number): Promise<CleanLogsResponse> => {
    return apiClient.post<CleanLogsResponse>('/audit-logs/clean', undefined, {
      params: daysToKeep ? { daysToKeep } : undefined,
    });
  },

  // 获取当前用户的操作历史
  getMyLogs: async (limit?: number): Promise<AuditLog[]> => {
    return apiClient.get<AuditLog[]>('/audit-logs/my-logs', {
      params: limit ? { limit } : undefined,
    });
  },
};
