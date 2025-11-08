'use client';

import { Header } from './Header';
import { PageTransition } from './PageTransition';
import { PageProgress } from './PageProgress';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <PageProgress />
      <Header />
      <main className="flex-1 overflow-hidden">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
