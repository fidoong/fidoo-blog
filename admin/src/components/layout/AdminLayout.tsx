/**
 * 管理后台布局组件
 */

'use client';

import React, { useState, useMemo } from 'react';
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
import { getMenuIcon } from './iconMap';
import type { MenuProps } from 'antd';
import type { MenuItem } from '@/types/menu';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();
  const { user, menus, clearAuth } = useAuthStore();

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
            item.children = childItems;
          }
        }

        // 如果没有子菜单且有路径，添加点击事件
        if (!item.children && menu.path) {
          item.onClick = () => {
            router.push(menu.path!);
          };
        }

        return item;
      })
      .filter((item) => {
        // 过滤掉没有子菜单且没有路径的项（无效菜单项）
        return item.children || item.onClick;
      });
  };

  const menuItems = useMemo(() => {
    // 调试：打印菜单数据
    if (process.env.NODE_ENV === 'development' && menus) {
      console.log('[AdminLayout] 原始菜单数据:', menus);
      console.log('[AdminLayout] 菜单数量:', menus.length);
    }
    const items = buildMenuItems(menus || []);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AdminLayout] 构建后的菜单项:', items);
      console.log('[AdminLayout] 菜单项数量:', items.length);
    }
    return items;
  }, [menus, pathname]);

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
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
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
          style={{ borderRight: 0, height: 'calc(100vh - 64px)', overflowY: 'auto' }}
        />
      </Sider>
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.2s',
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
            left: collapsed ? 80 : 200,
            zIndex: 99,
            transition: 'left 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 64, height: 64 }}
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
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
