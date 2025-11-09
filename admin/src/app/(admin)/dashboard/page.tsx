/**
 * 仪表盘页面
 */

'use client';

import React, { Suspense } from 'react';
import { Row, Col, Skeleton } from 'antd';
import { UserOutlined, FileTextOutlined, TagsOutlined, CommentOutlined } from '@ant-design/icons';
import { StatsCard } from '@/components/dashboard/StatsCard';

// 懒加载图表组件（如果将来需要）
// const DashboardChart = dynamic(() => import('@/components/dashboard/DashboardChart'), {
//   loading: () => <Skeleton active />,
//   ssr: false,
// });

// 优化：将统计卡片组件提取为独立组件，支持Suspense
function StatsCards({ stats }: { stats: typeof defaultStats }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <StatsCard title="用户总数" value={stats.users} prefix={<UserOutlined />} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatsCard title="文章总数" value={stats.posts} prefix={<FileTextOutlined />} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatsCard title="标签总数" value={stats.tags} prefix={<TagsOutlined />} />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatsCard title="评论总数" value={stats.comments} prefix={<CommentOutlined />} />
      </Col>
    </Row>
  );
}

const defaultStats = {
  users: 1128,
  posts: 1128,
  tags: 1128,
  comments: 1128,
};

export default function DashboardPage() {
  // TODO: 从 API 获取统计数据
  const stats = defaultStats;

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>仪表盘</h1>
      <Suspense
        fallback={
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4].map((i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Col>
            ))}
          </Row>
        }
      >
        <StatsCards stats={stats} />
      </Suspense>
    </div>
  );
}
