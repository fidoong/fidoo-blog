/**
 * Admin 根布局
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
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

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Fidoo Blog - 管理后台',
    template: '%s | Fidoo Blog Admin',
  },
  description: 'Fidoo Blog 企业级后台管理系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.variable} suppressHydrationWarning>
        <ErrorBoundaryWrapper>
          <ConfigProvider locale={zhCN}>
            <Providers>
              <FormDialogProvider>
                <AuthProvider>{children}</AuthProvider>
              </FormDialogProvider>
            </Providers>
          </ConfigProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
