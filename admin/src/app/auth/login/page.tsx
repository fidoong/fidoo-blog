/**
 * 登录页面
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { user, accessToken, _hasHydrated, setAuth, setPermissions, setMenus } = useAuthStore();

  // 如果已经登录，跳转到 dashboard
  useEffect(() => {
    if (!_hasHydrated) {
      return;
    }

    if (accessToken && user) {
      router.push('/dashboard');
    } else {
      setChecking(false);
    }
  }, [_hasHydrated, accessToken, user, router]);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);

      // 先保存 token 到 localStorage，确保后续请求可以获取到 token
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }

      // 保存认证信息到 store
      setAuth(response.user, response.accessToken, response.refreshToken);

      // 获取权限和菜单（此时 token 已经保存，可以正常请求）
      const [permissions, menus] = await Promise.all([
        authApi.getPermissions(),
        authApi.getMenus(),
      ]);

      setPermissions(permissions);
      setMenus(menus);

      message.success('登录成功');
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '登录失败，请检查用户名和密码';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 等待 hydration 完成或检查是否已登录
  if (checking || !_hasHydrated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card title="Fidoo Blog 管理后台" style={{ width: 400 }}>
        <Form name="login" onFinish={handleSubmit} autoComplete="off" size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
