'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Github, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils/cn';

// 登录表单验证
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(6, '密码至少6位'),
});

// 注册表单验证
const registerSchema = z
  .object({
    username: z.string().min(3, '用户名至少3位').max(20, '用户名最多20位'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少6位'),
    confirmPassword: z.string(),
    nickname: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 登录表单
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 注册表单
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // 重置表单和状态
  useEffect(() => {
    if (!isOpen) {
      loginForm.reset();
      registerForm.reset();
      setError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode, loginForm, registerForm]);

  // ESC 键关闭弹窗
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 切换模式
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    loginForm.reset();
    registerForm.reset();
  };

  // 登录提交
  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      const loginResponse = await authApi.login(data);
      const { user, accessToken, refreshToken } = loginResponse;
      setAuth(user, accessToken, refreshToken);
      onClose();
      loginForm.reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || '登录失败，请检查用户名和密码');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 注册提交
  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      const registerResponse = await authApi.register(registerData);
      const { user, accessToken, refreshToken } = registerResponse;
      setAuth(user, accessToken, refreshToken);
      onClose();
      registerForm.reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || '注册失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OAuth 登录
  const handleGithubLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const redirectUri = `${window.location.origin}/auth/callback?provider=github`;
    const githubAuthUrl = `${apiUrl}/auth/github?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = githubAuthUrl;
  };

  const handleWechatLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const redirectUri = `${window.location.origin}/auth/callback?provider=wechat`;
    const wechatAuthUrl = `${apiUrl}/auth/wechat?redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = wechatAuthUrl;
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 内容区域 - 可滚动 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8">
            {/* 标题和模式切换 */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {mode === 'login' ? '欢迎回来' : '创建账号'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {mode === 'login' ? '登录以继续使用' : '注册新账号开始使用'}
              </p>
              <div className="flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => switchMode('login')}
                  className={cn(
                    'pb-2 px-1 text-sm font-medium transition-all duration-200 border-b-2',
                    mode === 'login'
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700',
                  )}
                >
                  登录
                </button>
                <button
                  onClick={() => switchMode('register')}
                  className={cn(
                    'pb-2 px-1 text-sm font-medium transition-all duration-200 border-b-2',
                    mode === 'register'
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700',
                  )}
                >
                  注册
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* OAuth 登录按钮 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                onClick={handleGithubLogin}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <Github className="h-4 w-4" />
                <span className="text-sm font-medium text-gray-700">GitHub</span>
              </button>
              <button
                onClick={handleWechatLogin}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.597-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.18c-1.693-.052-3.716.445-5.302 1.733-1.58 1.283-2.599 3.107-1.815 5.493.488 1.483 1.795 2.515 3.301 2.515.198 0 .398-.013.595-.037l.012-.001c.274.02.54.03.808.03 4.033 0 7.353-2.797 7.353-6.233-.001-2.876-2.365-5.303-5.552-5.5zm-3.007 3.018c.473 0 .856.39.856.87s-.384.87-.856.87a.864.864 0 0 1-.856-.87.864.864 0 0 1 .856-.87zm3.805 0c.473 0 .856.39.856.87s-.384.87-.856.87a.864.864 0 0 1-.856-.87.864.864 0 0 1 .856-.87z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">微信</span>
              </button>
            </div>

            {/* 分隔线 */}
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 text-xs">
                  {mode === 'login' ? '或使用账号密码登录' : '或使用邮箱注册'}
                </span>
              </div>
            </div>

            {/* 登录表单 */}
            {mode === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                    用户名
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...loginForm.register('username')}
                      type="text"
                      id="login-username"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="请输入用户名"
                    />
                  </div>
                  {loginForm.formState.errors.username && (
                    <p className="mt-1 text-xs text-red-600">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...loginForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="请输入密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
                >
                  {isSubmitting ? '登录中...' : '登录'}
                </button>
            </form>
          )}

            {/* 注册表单 */}
            {mode === 'register' && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                      用户名
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...registerForm.register('username')}
                        type="text"
                        id="register-username"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="3-20位"
                      />
                    </div>
                    {registerForm.formState.errors.username && (
                      <p className="mt-1 text-xs text-red-600">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="register-nickname" className="block text-sm font-medium text-gray-700 mb-1.5">
                      昵称（可选）
                    </label>
                    <input
                      {...registerForm.register('nickname')}
                      type="text"
                      id="register-nickname"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="选填"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...registerForm.register('email')}
                      type="email"
                      id="register-email"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="请输入邮箱地址"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      密码
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...registerForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        id="register-password"
                        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="至少6位"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="mt-1 text-xs text-red-600">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="register-confirm-password"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      确认密码
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...registerForm.register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="register-confirm-password"
                        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="再次输入"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md mt-1"
                >
                  {isSubmitting ? '注册中...' : '注册'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

