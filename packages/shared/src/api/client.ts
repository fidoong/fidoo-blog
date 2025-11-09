/**
 * 统一的 Axios 客户端封装
 * 提供统一的请求/响应拦截器、错误处理和类型提示
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { ApiResponse, ResponseCode } from '../types';

/**
 * API 错误类
 */
export class ApiError extends Error {
  code: number;
  message: string;
  data?: unknown;
  timestamp: string;
  originalError?: AxiosError;

  constructor(
    code: number,
    message: string,
    timestamp: string,
    data?: unknown,
    originalError?: AxiosError,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = timestamp;
    this.originalError = originalError;
  }
}

/**
 * 获取 Token 的函数类型
 */
export type GetTokenFn = () => string | null;

/**
 * Token 刷新函数类型
 */
export type RefreshTokenFn = (refreshToken: string) => Promise<{
  accessToken: string;
  refreshToken?: string;
}>;

/**
 * 认证状态更新函数类型
 */
export type UpdateAuthFn = (accessToken: string, refreshToken?: string) => void;

/**
 * 清除认证函数类型
 */
export type ClearAuthFn = () => void;

/**
 * 跳转登录函数类型
 */
export type RedirectToLoginFn = () => void;

/**
 * API 客户端配置
 */
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  getToken?: GetTokenFn;
  refreshToken?: RefreshTokenFn;
  updateAuth?: UpdateAuthFn;
  clearAuth?: ClearAuthFn;
  redirectToLogin?: RedirectToLoginFn;
  enableLogging?: boolean;
}

/**
 * 统一的 API 客户端类
 */
export class ApiClient {
  private client: AxiosInstance;
  private config: Required<
    Pick<
      ApiClientConfig,
      'getToken' | 'refreshToken' | 'updateAuth' | 'clearAuth' | 'enableLogging'
    >
  > &
    Pick<ApiClientConfig, 'baseURL' | 'timeout'> & {
      redirectToLogin: RedirectToLoginFn;
    };

  constructor(config: ApiClientConfig = {}) {
    const {
      baseURL = typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1'
        : 'http://localhost:3005/api/v1',
      timeout = 30000,
      getToken = () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('accessToken');
      },
      refreshToken,
      updateAuth = (accessToken: string, refreshToken?: string) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
      },
      clearAuth = () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },
      redirectToLogin,
      enableLogging = typeof window !== 'undefined' && process.env.NODE_ENV === 'development',
    } = config;

    this.config = {
      baseURL,
      timeout,
      getToken,
      refreshToken: refreshToken || this.defaultRefreshToken,
      updateAuth,
      clearAuth,
      redirectToLogin:
        redirectToLogin ??
        (() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }),
      enableLogging,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    this.setupInterceptors();

    if (this.config.enableLogging) {
      console.log('[API Client] 初始化完成，Base URL:', this.config.baseURL);
    }
  }

  /**
   * 默认的 Token 刷新实现
   */
  private defaultRefreshToken = async (
    refreshToken: string,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> => {
    const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>(
      `${this.config.baseURL}/auth/refresh`,
      { refreshToken },
    );

    if (response.data.code === ResponseCode.SUCCESS && response.data.data) {
      return {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
      };
    }

    throw new ApiError(
      response.data.code || ResponseCode.UNAUTHORIZED,
      response.data.message || 'Token 刷新失败',
      response.data.timestamp,
      response.data.data,
    );
  };

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 添加 Token
        const token = this.config.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 开发环境日志
        if (this.config.enableLogging) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            baseURL: config.baseURL,
            params: config.params,
          });
        }

        return config;
      },
      (error: unknown) => {
        if (this.config.enableLogging) {
          console.error('[API Request Error]', error);
        }
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<unknown>>) => {
        const { data } = response;

        // 开发环境日志
        if (this.config.enableLogging) {
          console.log(
            `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
            {
              status: response.status,
              code: data.code,
              data: data.data,
            },
          );
        }

        // 检查业务错误码
        if (data.code !== ResponseCode.SUCCESS) {
          const error = new ApiError(
            data.code,
            data.message || '请求失败',
            data.timestamp,
            data.data,
          );
          return Promise.reject(error);
        }

        // 成功时直接返回 data 字段，让调用方直接使用数据
        return {
          ...response,
          data: data.data,
        } as AxiosResponse<unknown>;
      },
      async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 处理网络错误
        if (!error.response) {
          if (this.config.enableLogging) {
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
              console.error('[API Error] 请求超时，请检查后端服务是否运行在', this.config.baseURL);
            } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
              console.error('[API Error] 网络错误，请检查：');
              console.error('  1. 后端服务是否启动');
              console.error('  2. CORS 配置是否正确');
              console.error('  3. 防火墙设置');
            }
          }

          const apiError = new ApiError(
            ResponseCode.INTERNAL_ERROR,
            '网络错误，请检查后端服务连接',
            new Date().toISOString(),
            undefined,
            error,
          );
          return Promise.reject(apiError);
        }

        const response = error.response;
        const responseData = response.data;

        // 处理 401 未授权错误 - 尝试刷新 Token
        if (response.status === 401 && !originalRequest?._retry && this.config.refreshToken) {
          originalRequest._retry = true;

          try {
            const refreshToken =
              typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

            if (refreshToken) {
              const tokenData = await this.config.refreshToken(refreshToken);
              this.config.updateAuth(tokenData.accessToken, tokenData.refreshToken);

              // 重试原请求
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
              }

              return this.client(originalRequest);
            }
          } catch (refreshError: unknown) {
            // 刷新失败，清除认证信息
            this.config.clearAuth();

            // 跳转到登录页
            if (this.config.redirectToLogin) {
              this.config.redirectToLogin();
            } else if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }

            const apiError = new ApiError(
              ResponseCode.UNAUTHORIZED,
              'Token 已过期，请重新登录',
              new Date().toISOString(),
              undefined,
              refreshError instanceof AxiosError ? refreshError : error,
            );
            return Promise.reject(apiError);
          }
        }

        // 处理业务错误（后端返回的错误格式）
        if (responseData && typeof responseData === 'object' && 'code' in responseData) {
          const apiError = new ApiError(
            responseData.code,
            responseData.message || '请求失败',
            responseData.timestamp || new Date().toISOString(),
            'data' in responseData ? responseData.data : undefined,
            error,
          );

          if (this.config.enableLogging && response.status !== 401) {
            console.error('[API Error]', {
              url: originalRequest?.url,
              method: originalRequest?.method,
              status: response.status,
              code: responseData.code,
              message: responseData.message,
            });
          }

          return Promise.reject(apiError);
        }

        // 处理其他 HTTP 错误
        const apiError = new ApiError(
          response.status,
          error.message || '请求失败',
          new Date().toISOString(),
          responseData,
          error,
        );

        if (this.config.enableLogging && response.status !== 401) {
          console.error('[API Error]', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: response.status,
            statusText: response.statusText,
            message: error.message,
          });
        }

        return Promise.reject(apiError);
      },
    );
  }

  /**
   * 获取 Axios 实例（用于特殊场景）
   */
  get instance(): AxiosInstance {
    return this.client;
  }

  /**
   * GET 请求
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data as T;
  }

  /**
   * POST 请求
   */
  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data as T;
  }

  /**
   * PUT 请求
   */
  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data as T;
  }

  /**
   * PATCH 请求
   */
  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data as T;
  }

  /**
   * DELETE 请求
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data as T;
  }
}
