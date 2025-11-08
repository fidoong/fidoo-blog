/**
 * 性能工具函数
 */

/**
 * 预加载图片
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 预加载多个图片
 */
export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

/**
 * 延迟执行函数（用于性能优化）
 */
export function defer<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 0,
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * 批量处理（用于大量数据的分批处理）
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

/**
 * 使用 requestIdleCallback 执行低优先级任务
 */
export function runWhenIdle(callback: () => void, timeout?: number): ReturnType<typeof setTimeout> {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout }) as unknown as ReturnType<
      typeof setTimeout
    >;
  }
  // 降级到 setTimeout
  return setTimeout(callback, 1);
}

/**
 * 取消 idle 回调
 */
export function cancelIdleCallback(handle: ReturnType<typeof setTimeout>): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle as unknown as number);
  } else {
    clearTimeout(handle);
  }
}
