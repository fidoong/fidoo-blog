/**
 * 面包屑导航组件
 * 支持图标和动态路由生成
 */

'use client';

import React, { useMemo } from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  /**
   * 菜单数据（用于自动生成面包屑）
   */
  menus?: any[];
  /**
   * 自定义面包屑项
   */
  items?: BreadcrumbItem[];
  /**
   * 是否显示首页
   */
  showHome?: boolean;
}

/**
 * 从菜单数据中查找路径对应的菜单项
 */
function findMenuByPath(menus: any[], path: string): any | null {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuByPath(menu.children, path);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 构建面包屑路径
 */
function buildBreadcrumbPath(menus: any[], pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  const paths = pathname.split('/').filter(Boolean);

  // 添加首页
  items.push({
    title: '首页',
    path: '/dashboard',
    icon: <HomeOutlined />,
  });

  // 构建路径
  let currentPath = '';
  for (const segment of paths) {
    currentPath += `/${segment}`;
    const menu = findMenuByPath(menus, currentPath);
    if (menu) {
      items.push({
        title: menu.title || menu.name,
        path: menu.path,
        icon: menu.icon ? <span className={menu.icon} /> : null,
      });
    } else {
      // 如果没有找到对应的菜单，使用路径段作为标题
      items.push({
        title: segment,
        path: currentPath,
      });
    }
  }

  return items;
}

/**
 * 面包屑导航组件
 */
export function Breadcrumb({ menus = [], items, showHome = true }: BreadcrumbProps) {
  const pathname = usePathname();

  // 生成面包屑项
  const breadcrumbItems = useMemo(() => {
    if (items) {
      return items;
    }

    if (menus.length > 0) {
      return buildBreadcrumbPath(menus, pathname);
    }

    // 默认：根据路径生成
    const paths = pathname.split('/').filter(Boolean);
    const defaultItems: BreadcrumbItem[] = showHome
      ? [
          {
            title: '首页',
            path: '/dashboard',
            icon: <HomeOutlined />,
          },
        ]
      : [];

    paths.forEach((segment, index) => {
      const path = '/' + paths.slice(0, index + 1).join('/');
      defaultItems.push({
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        path,
      });
    });

    return defaultItems;
  }, [menus, items, pathname, showHome]);

  // 转换为 Ant Design Breadcrumb 格式
  const antBreadcrumbItems = breadcrumbItems.map((item, index) => {
    const isLast = index === breadcrumbItems.length - 1;
    return {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {item.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
          {isLast || !item.path ? (
            <span>{item.title}</span>
          ) : (
            <Link href={item.path} style={{ color: 'inherit' }}>
              {item.title}
            </Link>
          )}
        </span>
      ),
    };
  });

  return <AntBreadcrumb items={antBreadcrumbItems} separator="/" />;
}
