/**
 * 通知铃铛组件
 * 显示在用户头像左侧，显示未读通知数量
 */

'use client';

import React, { useState } from 'react';
import { Badge, Popover, Button, List, Empty, Divider, Typography, Space } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNotificationStore, type Notification } from '@/store/notification';
import { App } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text, Paragraph } = Typography;

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();
  const { modal } = App.useApp();
  const [open, setOpen] = useState(false);

  // 处理通知点击
  const handleNotificationClick = (notification: Notification) => {
    // 关闭 Popover
    setOpen(false);

    if (!notification.read) {
      markAsRead(notification.id);
    }

    // 显示通知详情
    modal.info({
      title: notification.title || '通知',
      content: (
        <div>
          <Paragraph>{notification.content}</Paragraph>
          {notification.onlineUsers !== undefined && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              当前在线用户数: {notification.onlineUsers}
            </Text>
          )}
          <Divider style={{ margin: '12px 0' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(notification.timestamp).format('YYYY-MM-DD HH:mm:ss')}
          </Text>
        </div>
      ),
      okText: '知道了',
      width: 400,
    });
  };

  // 通知列表内容
  const notificationContent = (
    <div style={{ width: 360, maxHeight: 400, overflowY: 'auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 16px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Text strong>通知</Text>
        <Space>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                markAllAsRead();
              }}
            >
              全部已读
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => {
                clearAll();
              }}
            >
              清空
            </Button>
          )}
        </Space>
      </div>
      {notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无通知"
          style={{ padding: '40px 20px' }}
        />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: notification.read ? 'transparent' : '#f0f7ff',
                borderLeft: notification.read ? 'none' : '3px solid #1890ff',
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong={!notification.read}>{notification.title || '通知'}</Text>
                    {!notification.read && (
                      <Badge status="processing" style={{ marginLeft: 4 }} />
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{ margin: 0, fontSize: 12, color: '#666' }}
                    >
                      {notification.content}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(notification.timestamp).fromNow()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      title={null}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayStyle={{ padding: 0 }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </Badge>
    </Popover>
  );
}

