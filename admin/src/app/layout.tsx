import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fidoo Blog Admin',
  description: '企业级博客系统 - 后台管理',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
