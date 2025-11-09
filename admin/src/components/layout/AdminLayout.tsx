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
  DashboardOutlined,
  TeamOutlined,
  SafetyOutlined,
  MenuOutlined,
  LockOutlined,
  AppstoreOutlined,
  FileOutlined,
  FileTextOutlined,
  TagsOutlined,
  CommentOutlined,
  DatabaseOutlined,
  ApiOutlined,
  KeyOutlined,
  UserSwitchOutlined,
  HomeOutlined,
  FolderOutlined,
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  DownloadOutlined,
  UploadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  BellOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  LinkOutlined,
  ShareAltOutlined,
  StarOutlined,
  HeartOutlined,
  LikeOutlined,
  DislikeOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  CrownOutlined,
  TrophyOutlined,
  GiftOutlined,
  ShoppingOutlined,
  ShopOutlined,
  BankOutlined,
  WalletOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CalculatorOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  TableOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  BorderOutlined,
  BorderInnerOutlined,
  BorderTopOutlined,
  BorderBottomOutlined,
  BorderLeftOutlined,
  BorderRightOutlined,
  BorderVerticleOutlined,
  BorderHorizontalOutlined,
  BorderOuterOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api/auth';
import { Breadcrumb } from './Breadcrumb';
import type { MenuProps } from 'antd';

// 图标映射表：将字符串映射到 Ant Design 图标组件
const iconMap: Record<string, React.ReactNode> = {
  // 基础图标
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  MenuOutlined: <MenuOutlined />,
  LockOutlined: <LockOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  FileOutlined: <FileOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  TagsOutlined: <TagsOutlined />,
  CommentOutlined: <CommentOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  ApiOutlined: <ApiOutlined />,
  KeyOutlined: <KeyOutlined />,
  UserSwitchOutlined: <UserSwitchOutlined />,
  HomeOutlined: <HomeOutlined />,
  FolderOutlined: <FolderOutlined />,
  BookOutlined: <BookOutlined />,
  SettingOutlined: <SettingOutlined />,
  
  // 操作图标
  EditOutlined: <EditOutlined />,
  DeleteOutlined: <DeleteOutlined />,
  PlusOutlined: <PlusOutlined />,
  SearchOutlined: <SearchOutlined />,
  ReloadOutlined: <ReloadOutlined />,
  ExportOutlined: <ExportOutlined />,
  ImportOutlined: <ImportOutlined />,
  DownloadOutlined: <DownloadOutlined />,
  UploadOutlined: <UploadOutlined />,
  EyeOutlined: <EyeOutlined />,
  EyeInvisibleOutlined: <EyeInvisibleOutlined />,
  CheckOutlined: <CheckOutlined />,
  CloseOutlined: <CloseOutlined />,
  
  // 提示图标
  InfoCircleOutlined: <InfoCircleOutlined />,
  WarningOutlined: <WarningOutlined />,
  QuestionCircleOutlined: <QuestionCircleOutlined />,
  
  // 通知图标
  BellOutlined: <BellOutlined />,
  MailOutlined: <MailOutlined />,
  PhoneOutlined: <PhoneOutlined />,
  
  // 网络图标
  GlobalOutlined: <GlobalOutlined />,
  LinkOutlined: <LinkOutlined />,
  ShareAltOutlined: <ShareAltOutlined />,
  
  // 社交图标
  StarOutlined: <StarOutlined />,
  HeartOutlined: <HeartOutlined />,
  LikeOutlined: <LikeOutlined />,
  DislikeOutlined: <DislikeOutlined />,
  FireOutlined: <FireOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  RocketOutlined: <RocketOutlined />,
  CrownOutlined: <CrownOutlined />,
  TrophyOutlined: <TrophyOutlined />,
  GiftOutlined: <GiftOutlined />,
  
  // 商业图标
  ShoppingOutlined: <ShoppingOutlined />,
  ShopOutlined: <ShopOutlined />,
  BankOutlined: <BankOutlined />,
  WalletOutlined: <WalletOutlined />,
  CreditCardOutlined: <CreditCardOutlined />,
  DollarOutlined: <DollarOutlined />,
  CalculatorOutlined: <CalculatorOutlined />,
  
  // 图表图标
  BarChartOutlined: <BarChartOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  PieChartOutlined: <PieChartOutlined />,
  AreaChartOutlined: <AreaChartOutlined />,
  
  // 列表图标
  TableOutlined: <TableOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
  OrderedListOutlined: <OrderedListOutlined />,
  
  // 边框图标
  BorderOutlined: <BorderOutlined />,
  BorderInnerOutlined: <BorderInnerOutlined />,
  BorderTopOutlined: <BorderTopOutlined />,
  BorderBottomOutlined: <BorderBottomOutlined />,
  BorderLeftOutlined: <BorderLeftOutlined />,
  BorderRightOutlined: <BorderRightOutlined />,
  BorderVerticleOutlined: <BorderVerticleOutlined />,
  BorderHorizontalOutlined: <BorderHorizontalOutlined />,
  BorderOuterOutlined: <BorderOuterOutlined />,
  RadiusUpleftOutlined: <RadiusUpleftOutlined />,
  RadiusUprightOutlined: <RadiusUprightOutlined />,
  RadiusBottomleftOutlined: <RadiusBottomleftOutlined />,
  RadiusBottomrightOutlined: <RadiusBottomrightOutlined />,
};

/**
 * 根据图标名称获取图标组件
 * @param iconName 图标名称（如 "UserOutlined"）或 CSS 类名（如 "icon-user"）
 * @returns React 节点
 */
function getMenuIcon(iconName?: string): React.ReactNode | null {
  if (!iconName) {
    return null;
  }
  
  // 如果是 Ant Design 图标名称，直接映射
  if (iconMap[iconName]) {
    return iconMap[iconName];
  }
  
  // 如果是 CSS 类名（以 "icon-" 或 "fa " 等开头），使用 span 渲染
  if (iconName.startsWith('icon-') || iconName.startsWith('fa ') || iconName.includes(' ')) {
    return <span className={iconName} />;
  }
  
  // 默认返回 null
  return null;
}

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
  const buildMenuItems = (menuList: any[]): MenuProps['items'] => {
    return menuList
      .filter((menu) => menu.status === 'enabled' && !menu.isHidden)
      .map((menu) => {
        const item: any = {
          key: menu.path || menu.id,
          icon: getMenuIcon(menu.icon),
          label: menu.title || menu.name,
        };

        if (menu.children && menu.children.length > 0) {
          item.children = buildMenuItems(menu.children);
        } else if (menu.path) {
          item.onClick = () => {
            router.push(menu.path);
          };
        }

        return item;
      });
  };

  const menuItems = useMemo(() => buildMenuItems(menus || []), [menus, pathname]);

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

