/**
 * 图标映射表
 * 将字符串映射到 Ant Design 图标组件
 * 使用懒加载优化性能
 */

import React from 'react';
import {
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
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

/**
 * 图标组件映射表
 */
export const iconComponentMap: Record<string, React.ComponentType> = {
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
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
};

/**
 * 获取菜单图标
 * @param iconName 图标名称（如 "UserOutlined"）或 CSS 类名（如 "icon-user"）
 * @returns 图标组件或 null
 */
export function getMenuIcon(iconName?: string): React.ReactNode | null {
  if (!iconName) {
    return null;
  }

  // 如果是 Ant Design 图标名称，创建图标组件
  const IconComponent = iconComponentMap[iconName];
  if (IconComponent) {
    return React.createElement(IconComponent);
  }

  // 如果是 CSS 类名（以 "icon-" 或 "fa " 等开头），使用 span 渲染
  if (iconName.startsWith('icon-') || iconName.startsWith('fa ') || iconName.includes(' ')) {
    return React.createElement('span', { className: iconName });
  }

  // 默认返回 null
  return null;
}
