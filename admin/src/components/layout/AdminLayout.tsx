/**
 * 管理后台布局组件
 */

'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api/auth';
import { Breadcrumb } from './Breadcrumb';
import { RouteProgress } from './RouteProgress';
import { PageTransition } from './PageTransition';
import { getMenuIcon } from './iconMap';
import type { MenuProps } from 'antd';
import type { MenuItem } from '@/types/menu';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();
  const { user, menus, clearAuth } = useAuthStore();

  // 优化：使用startTransition包装非紧急更新
  const handleCollapse = (newCollapsed: boolean) => {
    startTransition(() => {
      setCollapsed(newCollapsed);
    });
  };

  const menuItems = useMemo(() => {
    // 构建菜单项
    const buildMenuItems = (menuList: MenuItem[]): MenuProps['items'] => {
      if (!menuList || menuList.length === 0) {
        return [];
      }

      return menuList
        .filter((menu) => {
          // 过滤：只显示启用且未隐藏的菜单
          return menu.status === 'enabled' && !menu.isHidden;
        })
        .map((menu) => {
          const item: MenuProps['items'][0] = {
            key: menu.path || menu.id,
            icon: getMenuIcon(menu.icon),
            label: menu.title || menu.name,
          };

          // 如果有子菜单，递归构建
          if (menu.children && menu.children.length > 0) {
            const childItems = buildMenuItems(menu.children);
            // 只有当子菜单不为空时才添加 children
            if (childItems && childItems.length > 0) {
              item.children = childItems as any;
            }
          }

          // 如果没有子菜单且有路径，添加点击事件
          // 优化：使用startTransition包装路由跳转，提升感知性能
          if (!(item as any).children && menu.path) {
            item.onClick = () => {
              startTransition(() => {
                router.push(menu.path!);
              });
            };
          }

          return item;
        })
        .filter((item) => {
          // 过滤掉没有子菜单且没有路径的项（无效菜单项）
          return (item as any).children || item.onClick;
        });
    };

    // 调试：打印菜单数据
    if (process.env.NODE_ENV === 'development' && menus) {
      console.log('[AdminLayout] 原始菜单数据:', menus);
      console.log('[AdminLayout] 菜单数量:', menus.length);
    }
    const items = buildMenuItems(menus || []);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AdminLayout] 构建后的菜单项:', items);
      console.log('[AdminLayout] 菜单项数量:', items?.length || 0);
    }
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menus, router, startTransition]);

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => router.push('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('登出失败:', error);
        } finally {
          clearAuth();
          router.push('/auth/login');
        }
      },
    },
  ];

  return (
    <>
      <RouteProgress />
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={200}
          collapsedWidth={80}
          style={{
            background: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorder}`,
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            height: '100vh',
            overflow: 'hidden',
            zIndex: 100,
            // 优化：使用GPU加速的过渡动画
            transition:
              'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: `1px solid ${token.colorBorder}`,
              fontSize: 18,
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {collapsed ? 'FB' : 'Fidoo Blog'}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            style={{
              borderRight: 0,
              height: 'calc(100vh - 64px)',
              overflowY: 'auto',
              // 优化：使用GPU加速滚动
              transform: 'translateZ(0)',
              willChange: 'scroll-position',
            }}
          />
        </Sider>
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 200,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            // 优化：使用GPU加速的过渡动画
            transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'margin-left',
          }}
        >
          <Header
            style={{
              padding: '0 16px',
              background: token.colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${token.colorBorder}`,
              height: 64,
              position: 'fixed',
              top: 0,
              right: 0,
              left: 0,
              width: `100%`,
              zIndex: 99,
              // 优化：使用GPU加速的过渡动画
              transition:
                'left 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'left, width',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => handleCollapse(!collapsed)}
                loading={isPending}
                style={{
                  fontSize: 16,
                  width: 64,
                  height: 64,
                  // 优化：添加hover过渡效果
                  transition: 'background-color 0.2s',
                }}
              />
              <Breadcrumb menus={menus || []} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar icon={<UserOutlined />} src={user?.avatar} />
                  <span>{user?.nickname || user?.username}</span>
                </div>
              </Dropdown>
            </div>
          </Header>
          <Content
            style={{
              marginTop: 64,
              padding: 24,
              background: token.colorBgContainer,
              borderRadius: token.borderRadius,
              overflowY: 'auto',
              height: 'calc(100vh - 64px)',
              // 优化：使用GPU加速滚动和内容渲染
              transform: 'translateZ(0)',
              willChange: 'scroll-position',
              // 优化：平滑滚动
              scrollBehavior: 'smooth',
            }}
          >
            <PageTransition>{children}</PageTransition>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
