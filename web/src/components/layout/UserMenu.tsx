'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  LogOut,
  Bookmark,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';
import { FadeIn } from '@/components/ui/animation';

interface UserMenuProps {
  onClose?: () => void;
}

export function UserMenu({ onClose }: UserMenuProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    clearAuth();
    setIsOpen(false);
    onClose?.();
    window.location.href = '/';
  };

  // 点击外部关闭菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-50 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Avatar
          src={user.avatar}
          alt={user.nickname || user.username}
          size="sm"
        />
        <span className="hidden xl:inline text-sm font-medium text-gray-700">
          {user.nickname || user.username}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 hidden xl:block transition-transform duration-200',
            isOpen && 'transform rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <FadeIn>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <Link
              href="/profile"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>个人中心</span>
            </Link>
            <Link
              href="/profile?tab=favorites"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Bookmark className="h-4 w-4" />
              <span>我的收藏</span>
            </Link>
            <Link
              href="/profile?tab=settings"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>设置</span>
            </Link>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>退出登录</span>
            </button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

