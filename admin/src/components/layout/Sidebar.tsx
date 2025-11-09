'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LogOut, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { useUserMenus, buildMenuTree } from '@/hooks/usePermissions';
import { Menu } from '@/lib/api/menus';
import * as Icons from 'lucide-react';

// 动态获取图标
const getIcon = (iconName?: string) => {
  if (!iconName) return Icons.LayoutDashboard;
  const Icon = (Icons as any)[iconName];
  return Icon || Icons.LayoutDashboard;
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { data: menus = [], isLoading } = useUserMenus();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      router.push('/auth/login');
    }
  };

  // 检查后端返回的数据是否已经是树形结构
  const menuTree = useMemo(() => {
    // 如果后端已经返回树形结构（有 children 属性），直接使用
    if (menus.length > 0 && menus[0]?.children !== undefined) {
      // 检查是否是树形结构：至少有一个菜单有 children 属性
      const hasTreeStructure = menus.some((m) => m.children && Array.isArray(m.children));
      if (hasTreeStructure) {
        return menus;
      }
    }
    // 否则使用 buildMenuTree 构建树形结构（向后兼容）
    return buildMenuTree(menus);
  }, [menus]);

  // 初始化：默认展开有子菜单的根菜单（只在菜单数据首次加载时执行）
  useEffect(() => {
    if (menuTree.length > 0 && expandedMenus.size === 0) {
      const defaultExpanded = new Set<string>();
      menuTree.forEach((menu) => {
        if (menu.children && menu.children.length > 0) {
          defaultExpanded.add(menu.id);
        }
      });
      if (defaultExpanded.size > 0) {
        setExpandedMenus(defaultExpanded);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuTree.length]); // 只依赖菜单树长度，避免无限循环

  // 调试：打印菜单数据（只在菜单数据变化时打印一次）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && menus.length > 0) {
      console.log('原始菜单数据:', menus);
      console.log('构建后的菜单树:', menuTree);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menus.length]); // 只依赖菜单数组长度，避免频繁打印

  // 切换菜单展开/折叠
  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(menuId)) {
        newExpanded.delete(menuId);
      } else {
        newExpanded.add(menuId);
      }
      return newExpanded;
    });
  };

  // 渲染菜单项（支持多级递归）
  const renderMenuItem = (menu: Menu, level = 0) => {
    const Icon = getIcon(menu.icon);
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.id);
    const isActive =
      menu.path && (pathname === menu.path || pathname.startsWith(menu.path + '/'));
    const hasValidPath = menu.path && menu.path !== '#' && menu.path !== '';
    const indentWidth = level * 20; // 每级缩进 20px

    return (
      <div key={menu.id} className="space-y-0.5">
        <div
          className={cn(
            'group relative flex items-center rounded-lg transition-colors',
            level > 0 && 'ml-4',
          )}
          style={{ marginLeft: `${indentWidth}px` }}
        >
          {/* 树形连接线 - 多级支持 */}
          {level > 0 && (
            <div
              className="absolute -left-4 top-0 bottom-0 w-4 flex items-center pointer-events-none"
              style={{ left: `${indentWidth - 16}px` }}
            >
              <div className="w-px h-full bg-border/50" />
              <div
                className="absolute left-0 top-1/2 w-2 h-px bg-border/50 -translate-y-1/2"
                style={{ left: `${indentWidth - 16}px` }}
              />
            </div>
          )}

          {/* 菜单内容 */}
          {/* 如果有子菜单，不允许跳转，只能展开/收起 */}
          {hasChildren ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu(menu.id);
              }}
              className={cn(
                'flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all flex-1 min-w-0 cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                level > 0 && 'text-xs',
              )}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMenu(menu.id);
                }}
                className="p-0.5 hover:bg-accent/50 rounded transition-colors flex-shrink-0"
                type="button"
                title={isExpanded ? '收起' : '展开'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{menu.title || menu.name}</span>
            </div>
          ) : hasValidPath ? (
            // 没有子菜单且有有效路径，允许跳转
            <Link
              href={menu.path}
              onClick={handleMenuItemClick}
              className={cn(
                'flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all flex-1 min-w-0',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                level > 0 && 'text-xs',
              )}
              prefetch={true}
            >
              <div className="w-4 flex-shrink-0" />
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{menu.title || menu.name}</span>
            </Link>
          ) : (
            // 没有子菜单且没有有效路径，显示为普通文本
            <div
              className={cn(
                'flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all flex-1 min-w-0',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground',
                level > 0 && 'text-xs',
              )}
            >
              <div className="w-4 flex-shrink-0" />
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{menu.title || menu.name}</span>
            </div>
          )}
        </div>

        {/* 递归渲染子菜单（支持多级） */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {menu.children?.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 处理菜单项点击 - 只在移动端关闭侧边栏
  const handleMenuItemClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/dashboard" className="flex items-center space-x-2" onClick={handleMenuItemClick}>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="text-lg font-semibold">Fidoo Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">加载中...</div>
            ) : menuTree.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                暂无菜单
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs space-y-1">
                    <div>原始数据长度: {menus.length}</div>
                    <div>树形数据长度: {menuTree.length}</div>
                    <div>菜单数据类型: {Array.isArray(menus) ? '数组' : typeof menus}</div>
                    {menus.length > 0 && (
                      <div className="mt-2 text-xs text-left">
                        原始数据: {JSON.stringify(menus.slice(0, 2), null, 2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              menuTree.map((menu) => renderMenuItem(menu))
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t p-4 space-y-2">
            <div className="flex items-center space-x-3 rounded-lg px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground text-xs font-semibold">
                  {user?.nickname?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.nickname || user?.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

