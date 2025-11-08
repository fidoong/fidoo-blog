import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fidoo Blog App',
  description: '企业级博客系统 - 移动端',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
