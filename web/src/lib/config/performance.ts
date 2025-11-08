/**
 * 性能配置
 */

// 图片优化配置
export const IMAGE_CONFIG = {
  // 默认占位符
  BLUR_DATA_URL:
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  // 图片尺寸
  SIZES: {
    thumbnail: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    featured: '(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw',
    cover: '(max-width: 768px) 100vw, 100vw',
  },
} as const;

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 12,
  LARGE_PAGE_SIZE: 20,
  INFINITE_SCROLL_THRESHOLD: 0.8, // 距离底部80%时加载更多
} as const;

// 缓存配置
export const CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5分钟
  GC_TIME: 10 * 60 * 1000, // 10分钟
  REFETCH_INTERVAL: false, // 不自动重新获取
} as const;

// 防抖配置
export const DEBOUNCE_CONFIG = {
  SEARCH: 300, // 搜索防抖300ms
  SCROLL: 100, // 滚动防抖100ms
  RESIZE: 150, // 窗口大小改变防抖150ms
} as const;

// 预加载配置
export const PREFETCH_CONFIG = {
  HOVER_DELAY: 100, // 鼠标悬停100ms后预加载
  ROUTE_PREFETCH: true, // 启用路由预加载
} as const;
