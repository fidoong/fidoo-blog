'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  User,
  LogOut,
  LogIn,
  BookOpen,
  Menu,
  Tag,
  Settings,
  Bookmark,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils/cn';
import { useState, useRef, useEffect } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    clearAuth();
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchOpen(false);
      setSearchKeyword('');
    }
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <Link href="/" className="flex items-center space-x-1.5 group flex-shrink-0">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <span className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              Fidoo Blog
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium px-3 py-1.5 transition-colors rounded-md flex items-center gap-1.5',
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50',
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar - 桌面端 */}
          <div className="hidden md:flex flex-1 max-w-md" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="搜索文章、标签..."
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchKeyword('');
                      setSearchOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-primary-600 rounded-md transition-colors"
              title="搜索"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* 标签入口 - 桌面端 */}
            <Link
              href="/tags"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Tag className="h-4 w-4" />
              <span>标签</span>
            </Link>

            {/* 用户相关 */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nickname || user.username}
                      className="h-7 w-7 rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center border-2 border-gray-200">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                  <span className="hidden xl:inline text-sm font-medium text-gray-700">
                    {user.nickname || user.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden xl:block" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>个人中心</span>
                    </Link>
                    <Link
                      href="/profile?tab=favorites"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>我的收藏</span>
                    </Link>
                    <Link
                      href="/profile?tab=settings"
                      onClick={() => setUserMenuOpen(false)}
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
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">登录</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-primary-600 rounded-md transition-colors"
              aria-label="菜单"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-gray-100 py-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索文章、标签..."
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword('');
                    setSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-gray-400" />
                </button>
              )}
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-2">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md transition-colors',
                      isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50',
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* 认证弹窗 */}
      <AuthModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </header>
  );
}
