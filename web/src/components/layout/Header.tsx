'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, User, LogOut, LogIn, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils/cn';

const navItems = [
  { href: '/', label: '首页' },
  { href: '/categories', label: '分类' },
  { href: '/tags', label: '标签' },
  { href: '/about', label: '关于' },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 shadow-sm shadow-gray-900/5">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <BookOpen className="h-6 w-6 text-primary-600" />
            </motion.div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              Fidoo Blog
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium relative px-3 py-1.5 transition-all duration-300',
                  pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-white/50 rounded-lg',
                )}
              >
                <span className="relative">{item.label}</span>
                {pathname === item.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Search and User */}
          <div className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                href="/search"
                className="p-2 text-gray-700 hover:text-primary-600 hover:bg-white/50 rounded-lg transition-all duration-200 block"
              >
                <Search className="h-5 w-5" />
              </Link>
            </motion.div>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-white/50 px-2 py-1.5 rounded-lg transition-all duration-200"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.nickname || user.username}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                  <span className="hidden sm:inline">{user.nickname || user.username}</span>
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="p-2 text-gray-700 hover:text-primary-600 hover:bg-white/50 rounded-lg transition-all duration-200"
                  title="登出"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-white/50 px-2 py-1.5 rounded-lg transition-all duration-200"
              >
                <LogIn className="h-5 w-5" />
                <span className="hidden sm:inline">登录</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
