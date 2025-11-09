'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '@/lib/api/system';
import { formatFileSize } from '@/lib/utils/index';

function SystemPage() {
  const { data: systemInfo, isLoading: systemLoading } = useQuery({
    queryKey: ['system-info'],
    queryFn: () => systemApi.getSystemInfo(),
  });

  const { data: processInfo, isLoading: processLoading } = useQuery({
    queryKey: ['process-info'],
    queryFn: () => systemApi.getProcessInfo(),
  });

  const info = systemInfo;
  const process = processInfo;

  return (
    <ProtectedRoute requiredPermissions={['system:info:view']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">系统设置</h1>
            <p className="text-muted-foreground">系统信息和服务器状态</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>系统信息</CardTitle>
                <CardDescription>服务器基本信息</CardDescription>
              </CardHeader>
              <CardContent>
                {systemLoading ? (
                  <div className="text-center py-8 text-muted-foreground">加载中...</div>
                ) : info ? (
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Node 版本</dt>
                      <dd className="text-sm font-medium">{info.nodeVersion}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">平台</dt>
                      <dd className="text-sm font-medium">{info.platform}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">架构</dt>
                      <dd className="text-sm font-medium">{info.arch}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">CPU 核心数</dt>
                      <dd className="text-sm font-medium">{info.cpuCount}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">总内存</dt>
                      <dd className="text-sm font-medium">{formatFileSize(info.totalMemory)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">可用内存</dt>
                      <dd className="text-sm font-medium">{formatFileSize(info.freeMemory)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">运行时间</dt>
                      <dd className="text-sm font-medium">
                        {Math.floor(info.uptime / 3600)} 小时 {Math.floor((info.uptime % 3600) / 60)} 分钟
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">暂无数据</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>进程信息</CardTitle>
                <CardDescription>当前进程资源使用情况</CardDescription>
              </CardHeader>
              <CardContent>
                {processLoading ? (
                  <div className="text-center py-8 text-muted-foreground">加载中...</div>
                ) : process ? (
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">进程 ID</dt>
                      <dd className="text-sm font-medium">{process.pid}</dd>
                    </div>
                    {process.memory && (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">RSS 内存</dt>
                          <dd className="text-sm font-medium">{formatFileSize(process.memory.rss)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">堆内存总计</dt>
                          <dd className="text-sm font-medium">{formatFileSize(process.memory.heapTotal)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">堆内存已用</dt>
                          <dd className="text-sm font-medium">{formatFileSize(process.memory.heapUsed)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">外部内存</dt>
                          <dd className="text-sm font-medium">{formatFileSize(process.memory.external)}</dd>
                        </div>
                      </>
                    )}
                  </dl>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">暂无数据</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default SystemPage;

