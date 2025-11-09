/**
 * 分类管理页面
 * 使用 dynamic 实现代码分割和懒加载
 */

import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const CategoriesPageContent = dynamic(() => import('./CategoriesPageContent'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

export default function CategoriesPage() {
  return <CategoriesPageContent />;
}
