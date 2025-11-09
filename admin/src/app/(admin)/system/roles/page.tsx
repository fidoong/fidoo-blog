/**
 * 角色管理页面
 * 使用 dynamic 实现代码分割和懒加载
 */

import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const RolesPageContent = dynamic(() => import('./RolesPageContent'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

export default function RolesPage() {
  return <RolesPageContent />;
}
