/**
 * 用户管理页面
 * 使用 dynamic 实现代码分割和懒加载
 */

import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const UsersPageContent = dynamic(() => import('./UsersPageContent'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

export default function UsersPage() {
  return <UsersPageContent />;
}
