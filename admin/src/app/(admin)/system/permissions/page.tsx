/**
 * 权限管理页面
 * 使用 dynamic 实现代码分割和懒加载
 */

import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const PermissionsPageContent = dynamic(() => import('./PermissionsPageContent'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

export default function PermissionsPage() {
  return <PermissionsPageContent />;
}
