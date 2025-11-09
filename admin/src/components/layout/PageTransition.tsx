/**
 * 页面切换动画组件
 * 提供路由切换时的淡入淡出动画效果
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 路由变化时开始动画
    setIsAnimating(true);

    // 等待淡出动画完成后再切换内容
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      // 稍微延迟触发淡入动画，让过渡更自然
      requestAnimationFrame(() => {
        setIsAnimating(false);
      });
    }, 200); // 增加等待时间，让淡出更完整

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, children]);

  return (
    <div
      style={{
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? 'translateY(4px)' : 'translateY(0)',
        transition:
          'opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'opacity, transform',
        width: '100%',
        height: '100%',
      }}
    >
      {displayChildren}
    </div>
  );
}

