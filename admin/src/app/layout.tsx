/**
 * Admin 根布局
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import './globals.css';
import { Providers } from './providers';
import { FormDialogProvider } from '@/components/form/FormDialog';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ErrorBoundaryWrapper } from '@/components/error/ErrorBoundaryWrapper';

dayjs.locale('zh-cn');

// 优化字体加载：使用 next/font 自动优化，添加 preload
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: {
    default: 'Fidoo Blog - 管理后台',
    template: '%s | Fidoo Blog Admin',
  },
  description: 'Fidoo Blog 企业级后台管理系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  return (
    <html lang="zh-CN">
      <head>
        {/* 预连接API服务器，减少连接时间 */}
        {apiUrl && <link rel="preconnect" href={apiUrl} crossOrigin="anonymous" />}
        {/* DNS预解析 */}
        <link rel="dns-prefetch" href={apiUrl} />
      </head>
      <body className={inter.variable} suppressHydrationWarning>
        <ErrorBoundaryWrapper>
          <ConfigProvider
            locale={zhCN}
            theme={{
              token: {
                // 优化动画性能：使用GPU加速的动画
                motionDurationFast: '0.1s',
                motionDurationMid: '0.2s',
                motionDurationSlow: '0.3s',
              },
            }}
          >
            <Providers>
              <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                <FormDialogProvider>
                  <AuthProvider>{children}</AuthProvider>
                </FormDialogProvider>
              </Suspense>
            </Providers>
          </ConfigProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
