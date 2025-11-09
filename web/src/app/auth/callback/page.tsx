'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';
import { MainLayout } from '@/components/layout/MainLayout';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理授权...');

  useEffect(() => {
    const code = searchParams.get('code');
    const provider = searchParams.get('provider') as 'github' | 'wechat' | null;
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('授权失败：' + error);
      setTimeout(() => {
        router.push('/');
      }, 3000);
      return;
    }

    // 如果后端直接返回 token（推荐方式）
    if (token) {
      const handleTokenLogin = async () => {
        try {
          // 保存 token 到 localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
          }

          // 调用接口获取用户信息
          const profileResponse = await authApi.getProfile();
          if (profileResponse.code === 0 && profileResponse.data) {
            // 注意：这里只有 accessToken，没有 refreshToken
            // 如果后端也返回了 refreshToken，应该从 URL 参数中获取
            const refreshToken = searchParams.get('refreshToken') || '';
            if (refreshToken && typeof window !== 'undefined') {
              localStorage.setItem('refreshToken', refreshToken);
            }

            setAuth(profileResponse.data, token, refreshToken);
            setStatus('success');
            setMessage('登录成功，正在跳转...');
            setTimeout(() => {
              router.push('/');
            }, 1500);
          } else {
            setStatus('error');
            setMessage('获取用户信息失败');
            setTimeout(() => {
              router.push('/');
            }, 3000);
          }
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } }; message?: string };
          setStatus('error');
          setMessage(error.response?.data?.message || error.message || '登录失败');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      };

      handleTokenLogin();
      return;
    }

    // 如果有 code，调用后端接口换取 token
    if (code && provider) {
      const handleCallback = async () => {
        try {
          const loginResponse = await authApi.handleOAuthCallback(provider, code);
          const { user, accessToken, refreshToken } = loginResponse;
          setAuth(user, accessToken, refreshToken);
          setStatus('success');
          setMessage('登录成功，正在跳转...');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } }; message?: string };
          setStatus('error');
          setMessage(error.response?.data?.message || error.message || '登录失败');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      };

      handleCallback();
      return;
    }

    // 如果既没有 token 也没有 code
    setStatus('error');
    setMessage('缺少必要的授权参数');
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, [searchParams, router, setAuth]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
                <p className="text-gray-600">{message}</p>
              </div>
            )}
            {status === 'success' && (
              <div className="space-y-4">
                <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">{message}</p>
              </div>
            )}
            {status === 'error' && (
              <div className="space-y-4">
                <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-red-600">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

