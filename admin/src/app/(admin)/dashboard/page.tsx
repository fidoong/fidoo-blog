/**
 * 仪表盘页面
 */

'use client';

import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, FileTextOutlined, TagsOutlined, CommentOutlined } from '@ant-design/icons';

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>仪表盘</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="用户总数" value={1128} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="文章总数" value={1128} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="标签总数" value={1128} prefix={<TagsOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="评论总数" value={1128} prefix={<CommentOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
