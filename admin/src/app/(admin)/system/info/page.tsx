/**
 * 系统信息页面
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Alert } from 'antd';
import { apiClient } from '@/lib/api/client';

interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  cpuCount: number;
  totalMemory: number;
  freeMemory: number;
  uptime: number;
  nodeVersion: string;
}

interface ProcessInfo {
  pid: number;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

export default function SystemInfoPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [processInfo, setProcessInfo] = useState<ProcessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const [system, process] = await Promise.all([
          apiClient.get<SystemInfo>('/system/info'),
          apiClient.get<ProcessInfo>('/system/process'),
        ]);
        setSystemInfo(system);
        setProcessInfo(process);
        setError(null);
      } catch (err) {
        setError('获取系统信息失败');
        console.error('获取系统信息失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="系统信息" style={{ marginBottom: 16 }}>
        {systemInfo && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="平台">{systemInfo.platform}</Descriptions.Item>
            <Descriptions.Item label="架构">{systemInfo.arch}</Descriptions.Item>
            <Descriptions.Item label="主机名">{systemInfo.hostname}</Descriptions.Item>
            <Descriptions.Item label="Node版本">{systemInfo.nodeVersion}</Descriptions.Item>
            <Descriptions.Item label="运行时间">{formatUptime(systemInfo.uptime)}</Descriptions.Item>
            <Descriptions.Item label="CPU核心数">{systemInfo.cpuCount}</Descriptions.Item>
            <Descriptions.Item label="总内存">{formatBytes(systemInfo.totalMemory)}</Descriptions.Item>
            <Descriptions.Item label="空闲内存">{formatBytes(systemInfo.freeMemory)}</Descriptions.Item>
            <Descriptions.Item label="已用内存">
              {formatBytes(systemInfo.totalMemory - systemInfo.freeMemory)}
            </Descriptions.Item>
            <Descriptions.Item label="内存使用率">
              {(((systemInfo.totalMemory - systemInfo.freeMemory) / systemInfo.totalMemory) * 100).toFixed(2)}%
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card title="进程信息">
        {processInfo && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="进程ID">{processInfo.pid}</Descriptions.Item>
            <Descriptions.Item label="运行时间">{formatUptime(processInfo.uptime)}</Descriptions.Item>
            <Descriptions.Item label="RSS内存">{formatBytes(processInfo.memory.rss)}</Descriptions.Item>
            <Descriptions.Item label="堆总大小">{formatBytes(processInfo.memory.heapTotal)}</Descriptions.Item>
            <Descriptions.Item label="堆已用">{formatBytes(processInfo.memory.heapUsed)}</Descriptions.Item>
            <Descriptions.Item label="堆使用率">
              {((processInfo.memory.heapUsed / processInfo.memory.heapTotal) * 100).toFixed(2)}%
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
}

