'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthModal } from '@/components/auth/AuthModal';

export default function RegisterPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // 如果弹窗关闭，重定向到首页
    if (!isOpen) {
      router.push('/');
    }
  }, [isOpen, router]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <AuthModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            defaultMode="register"
          />
        </div>
      </div>
    </MainLayout>
  );
}
