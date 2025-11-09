/**
 * 路由进度条组件
 * 在页面切换时显示顶部进度条
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { theme } from 'antd';

const { useToken } = theme;

export function RouteProgress() {
  const pathname = usePathname();
  const { token } = useToken();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 路由变化时开始显示进度条
    setIsVisible(true);
    setProgress(0);

    // 模拟进度 - 使用更平滑的缓动函数
    let currentProgress = 0;
    const timer = setInterval(() => {
      if (currentProgress >= 85) {
        clearInterval(timer);
        return;
      }
      // 使用递减增量，让进度条开始快，后面慢
      const remaining = 85 - currentProgress;
      const increment = remaining * 0.15 + Math.random() * 3;
      currentProgress = Math.min(currentProgress + increment, 85);
      setProgress(currentProgress);
    }, 50);

    // 路由加载完成后完成进度条
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);
    }, 400);

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [pathname]);

  if (!isVisible) {
    return null;
  }

  // 使用 Ant Design 主题色
  const primaryColor = token.colorPrimary || '#1890ff';
  const primaryColorHover = token.colorPrimaryHover || '#40a9ff';
  const primaryColorActive = token.colorPrimaryActive || '#096dd9';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* 主进度条 */}
      <div
        style={{
          height: '100%',
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColorHover} 50%, ${primaryColorActive} 100%)`,
          width: `${progress}%`,
          transition:
            progress === 100 ? 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'width 0.1s linear',
          position: 'relative',
          boxShadow: `0 0 8px ${primaryColor}40, 0 0 4px ${primaryColor}20`,
        }}
      >
        {/* 光晕效果 */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '20%',
            background: `linear-gradient(90deg, transparent 0%, ${primaryColor}80 100%)`,
            filter: 'blur(4px)',
            transform: 'translateX(100%)',
          }}
        />
        {/* 高光效果 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
            borderRadius: '2px 2px 0 0',
          }}
        />
      </div>
    </div>
  );
}
