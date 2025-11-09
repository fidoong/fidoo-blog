import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1';

// 获取 auth store 的方法（延迟加载以避免循环依赖）
const getAuthStore = () => {
  if (typeof window === 'undefined') return null;
  try {
    // 使用动态导入避免循环依赖
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAuthStore } = require('@/store/auth');
    return useAuthStore;
  } catch {
    return null;
  }
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器 - 添加 token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            baseURL: config.baseURL,
            params: config.params,
          });
        }

        return config;
      },
      (error: unknown) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      },
    );

    // 响应拦截器 - 处理错误和 token 刷新
    this.client.interceptors.response.use(
      (response) => {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log(
            `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
            {
              status: response.status,
              data: response.data,
            },
          );
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (
          typeof window !== 'undefined' &&
          process.env.NODE_ENV === 'development' &&
          error.response?.status !== 401
        ) {
          console.error('[API Error]', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            code: error.code,
            response: error.response?.data,
          });
        }

        // 处理网络错误
        if (!error.response) {
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.error('[API Error] 请求超时，请检查后端服务是否运行在', API_URL);
          } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
            console.error('[API Error] 网络错误，请检查后端服务是否启动');
          }
          return Promise.reject(error);
        }

        // 处理 401 未授权错误
        if (error.response?.status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              if (response.data.code === 0 && response.data.data) {
                const { accessToken } = response.data.data;
                localStorage.setItem('accessToken', accessToken);

                // 同步更新 zustand store
                const store = getAuthStore();
                if (store) {
                  const setAccessToken = store.getState().setAccessToken;
                  if (setAccessToken) {
                    setAccessToken(accessToken);
                  }
                }

                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                return this.client(originalRequest);
              } else {
                throw new Error(response.data.message || 'Token 刷新失败');
              }
            }
          } catch (refreshError) {
            // 刷新失败，清除 token 并跳转到登录页
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');

              // 同步清除 zustand store
              const store = getAuthStore();
              if (store) {
                const clearAuth = store.getState().clearAuth;
                if (clearAuth) {
                  clearAuth();
                }
              }

              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;
