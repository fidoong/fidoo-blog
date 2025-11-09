/**
 * 媒体管理页面
 * 使用 dynamic 实现代码分割和懒加载
 */

import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const MediaPageContent = dynamic(() => import('./MediaPageContent'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

export default function MediaPage() {
  return <MediaPageContent />;
}
