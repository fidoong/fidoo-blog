'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { PageProgress } from './PageProgress';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PageProgress />
      <Header />
      <main className="flex-1 relative">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
