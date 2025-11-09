/**
 * 统计卡片组件
 * 用于仪表盘显示统计数据
 */

'use client';

import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  loading?: boolean;
}

export function StatsCard({ title, value, prefix, suffix, loading }: StatsCardProps) {
  return (
    <Card>
      <Statistic title={title} value={value} prefix={prefix} suffix={suffix} loading={loading} />
    </Card>
  );
}
