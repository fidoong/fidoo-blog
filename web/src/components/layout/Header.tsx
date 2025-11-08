'use client';

import Link from 'next/link';
import { BookOpen, LogIn, Menu, Tag, Edit, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { NavLink } from './NavLink';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { FadeIn } from '@/components/ui/animation';

export function Header() {
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // 导航项
  const navItems = [
    { href: '/', label: '首页', icon: BookOpen },
    { href: '/categories', label: '分类', icon: null },
    { href: '/tags', label: '标签', icon: Tag },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100/50 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-12 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-1.5 group flex-shrink-0 transition-transform duration-200 hover:scale-105"
          >
            <BookOpen className="h-5 w-5 text-primary-600" />
            <span className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              Fidoo Blog
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon || undefined}
              />
            ))}
          </nav>

          {/* Search Bar - 桌面端 */}
          <div className="hidden md:flex flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Mobile Search Button */}
            <IconButton
              variant={'ghost' as const}
              size={'md' as const}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="搜索"
              className="md:hidden"
            >
              <Search className="h-5 w-5" />
            </IconButton>

            {/* 写文章入口 - 仅登录用户可见 */}
            {isAuthenticated && (
              <Link href="/posts/create">
                <Button
                  variant={'default' as const}
                  size={'sm' as const}
                  className="flex items-center gap-1.5"
                >
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">写文章</span>
                </Button>
              </Link>
            )}

            {/* 标签入口 - 桌面端 */}
            <Link
              href="/tags"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all duration-200 hover:scale-105"
            >
              <Tag className="h-4 w-4" />
              <span>标签</span>
            </Link>

            {/* 用户相关 */}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Button
                variant={'ghost' as const}
                size={'sm' as const}
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center space-x-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">登录</span>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <IconButton
              variant={'ghost' as const}
              size={'md' as const}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="菜单"
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </IconButton>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <FadeIn>
            <div className="md:hidden border-t border-gray-100 py-3">
              <SearchBar mobile onClose={() => setSearchOpen(false)} />
            </div>
          </FadeIn>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <FadeIn>
            <div className="lg:hidden border-t border-gray-100 py-2">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon || undefined}
                  />
                ))}
              </nav>
            </div>
          </FadeIn>
        )}
      </div>

      {/* 认证弹窗 */}
      <AuthModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </header>
  );
}
