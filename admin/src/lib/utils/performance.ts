/**
 * 性能优化工具函数
 * 参考社区最佳实践，提供性能优化相关的工具函数
 */

/**
 * 防抖函数 - 用于搜索输入等场景
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数 - 用于滚动、resize等高频事件
 * @param func 要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 使用 requestIdleCallback 执行低优先级任务
 * 如果浏览器不支持，则使用 setTimeout 降级
 */
export function runIdleTask(callback: () => void, timeout = 5000): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * 使用 requestAnimationFrame 优化动画性能
 */
export function raf(callback: () => void): number {
  if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
    return window.requestAnimationFrame(callback);
  } else {
    return setTimeout(callback, 16) as unknown as number;
  }
}

/**
 * 预加载资源
 * @param href 资源URL
 * @param as 资源类型（如 'script', 'style', 'image'）
 */
export function preloadResource(href: string, as: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * 预取资源（低优先级）
 * @param href 资源URL
 */
export function prefetchResource(href: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * 使用 Intersection Observer 实现懒加载
 * @param element 要观察的元素
 * @param callback 回调函数
 * @param options 观察选项
 * @returns 清理函数
 */
export function observeIntersection(
  element: Element,
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // 降级：立即执行回调
    callback(true);
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      callback(entry.isIntersecting);
    });
  }, options);

  observer.observe(element);

  return () => observer.disconnect();
}

/**
 * 批量更新DOM，减少重排和重绘
 * @param updates 更新函数数组
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  if (typeof document === 'undefined') return;

  // 使用 requestAnimationFrame 批量执行
  raf(() => {
    updates.forEach((update) => update());
  });
}

/**
 * 测量函数执行时间（开发环境）
 * @param label 标签
 * @param fn 要测量的函数
 * @returns 函数执行结果
 */
export async function measurePerformance<T>(
  label: string,
  fn: () => T | Promise<T>
): Promise<T> {
  if (process.env.NODE_ENV !== 'development') {
    return fn();
  }

  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

/**
 * 检查是否支持 Web Workers
 */
export function supportsWebWorkers(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * 检查是否支持 Service Workers
 */
export function supportsServiceWorkers(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * 获取设备性能等级（基于硬件并发数）
 */
export function getDevicePerformanceLevel(): 'low' | 'medium' | 'high' {
  if (typeof navigator === 'undefined' || !('hardwareConcurrency' in navigator)) {
    return 'medium';
  }

  const cores = navigator.hardwareConcurrency || 2;
  if (cores <= 2) return 'low';
  if (cores <= 4) return 'medium';
  return 'high';
}

/**
 * 根据设备性能调整配置
 */
export function getPerformanceConfig() {
  const level = getDevicePerformanceLevel();
  const isLowEnd = level === 'low';

  return {
    // 动画持续时间
    animationDuration: isLowEnd ? 0.15 : 0.2,
    // 是否启用复杂动画
    enableComplexAnimations: !isLowEnd,
    // 图片质量
    imageQuality: isLowEnd ? 0.8 : 1,
    // 预加载数量
    preloadCount: isLowEnd ? 2 : 5,
  };
}

