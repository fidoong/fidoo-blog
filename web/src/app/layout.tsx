import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'Fidoo Blog - 技术博客社区',
    template: '%s | Fidoo Blog',
  },
  description: '分享技术，记录成长 - 现代化的技术博客社区',
  keywords: ['技术博客', '编程', '开发', '前端', '后端', '全栈'],
  authors: [{ name: 'Fidoo Blog' }],
  creator: 'Fidoo Blog',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    siteName: 'Fidoo Blog',
    title: 'Fidoo Blog - 技术博客社区',
    description: '分享技术，记录成长',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fidoo Blog - 技术博客社区',
    description: '分享技术，记录成长',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'} />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
