/**
 * 审计日志页面
 * 使用 dynamic 实现代码分割和懒加载
 */

import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';

const AuditLogsPageContent = dynamic(() => import('./AuditLogsPageContent'), {
  loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
  ssr: false,
});

export default function AuditLogsPage() {
  return <AuditLogsPageContent />;
}
