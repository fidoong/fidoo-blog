/**
 * 仪表盘页面
 */

'use client';

import React from 'react';
import { Row, Col } from 'antd';
import { UserOutlined, FileTextOutlined, TagsOutlined, CommentOutlined } from '@ant-design/icons';
import { StatsCard } from '@/components/dashboard/StatsCard';

// 懒加载图表组件（如果将来需要）
// const DashboardChart = dynamic(() => import('@/components/dashboard/DashboardChart'), {
//   loading: () => <Skeleton active />,
//   ssr: false,
// });

export default function DashboardPage() {
  // TODO: 从 API 获取统计数据
  const stats = {
    users: 1128,
    posts: 1128,
    tags: 1128,
    comments: 1128,
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>仪表盘</h1>
      <Row gutter={16}>
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
    </div>
  );
}
