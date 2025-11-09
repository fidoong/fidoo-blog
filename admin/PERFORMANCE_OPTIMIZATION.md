# Admin 性能优化文档

本文档记录了针对 admin 项目的性能优化措施，参考了社区开源优秀方案，重点关注用户体验、交互体验、感知性能、首屏加载、交互流畅度和动画体验。

## 优化概览

### 1. Next.js 配置优化

**文件**: `next.config.js`

- ✅ **图片优化**: 配置了 AVIF 和 WebP 格式支持，自动响应式图片尺寸
- ✅ **包导入优化**: 使用 `optimizePackageImports` 优化 antd、@ant-design/icons、@formily 的导入
- ✅ **CSS 优化**: 启用 `optimizeCss` 实验性功能
- ✅ **输出优化**: 使用 `standalone` 输出模式，减少部署体积
- ✅ **压缩**: 启用 gzip 压缩

### 2. 首屏加载优化

**文件**: `src/app/layout.tsx`

- ✅ **字体优化**: 
  - 使用 `next/font` 自动优化字体加载
  - 添加 `display: 'swap'` 避免字体加载阻塞渲染
  - 配置字体 fallback
- ✅ **资源预加载**: 
  - 添加 DNS 预解析 (`dns-prefetch`)
  - 添加 API 服务器预连接 (`preconnect`)
- ✅ **Suspense 边界**: 在关键位置添加 Suspense，提升感知性能
- ✅ **动画优化**: 配置 Ant Design 主题，使用更快的动画时长

### 3. React Query 优化

**文件**: `src/app/providers.tsx`

- ✅ **单例模式**: 使用单例 QueryClient，避免重复创建
- ✅ **智能重试**: 
  - 4xx 错误不重试（快速失败）
  - 指数退避重试策略
- ✅ **缓存策略**: 
  - `staleTime`: 5 分钟
  - `gcTime`: 10 分钟
- ✅ **网络模式**: 优化离线体验

### 4. 交互体验优化

**文件**: `src/components/layout/AdminLayout.tsx`

- ✅ **React 18 并发特性**: 使用 `useTransition` 包装非紧急更新
- ✅ **路由跳转优化**: 使用 `startTransition` 包装路由跳转，提升感知性能
- ✅ **GPU 加速动画**: 
  - 侧边栏折叠动画使用 `cubic-bezier` 缓动函数
  - 添加 `will-change` 提示浏览器优化
  - 使用 `transform: translateZ(0)` 启用硬件加速
- ✅ **平滑滚动**: 启用 `scroll-behavior: smooth`

### 5. CSS 和样式优化

**文件**: `src/app/globals.css`

- ✅ **硬件加速**: 
  - 全局启用 `transform: translateZ(0)`
  - 优化字体渲染 (`-webkit-font-smoothing`)
- ✅ **滚动优化**: 为可滚动元素启用硬件加速
- ✅ **过渡动画**: 
  - 按钮、菜单项、表格行添加平滑过渡
  - 卡片 hover 效果优化
- ✅ **可访问性**: 
  - 支持 `prefers-reduced-motion` 媒体查询
  - 优化焦点可见性
- ✅ **选择文本**: 优化文本选择颜色

### 6. 代码分割和懒加载

**优化页面**:
- ✅ 所有页面组件都使用 `dynamic import` 进行代码分割
- ✅ 统一的 loading 状态（Skeleton）
- ✅ 禁用 SSR（`ssr: false`）减少服务端负担

**已优化页面**:
- `dashboard/page.tsx` - 添加 Suspense 边界
- `users/page.tsx`
- `posts/page.tsx`
- `comments/page.tsx`
- `categories/page.tsx`
- `tags/page.tsx`
- `media/page.tsx`
- `system/info/page.tsx` - 新增代码分割
- `system/menus/page.tsx`
- `system/roles/page.tsx`
- `system/permissions/page.tsx`
- `system/audit-logs/page.tsx`
- `system/dictionaries/page.tsx`

### 7. 性能工具函数

**文件**: `src/lib/utils/performance.ts`

提供了一系列性能优化工具函数：
- ✅ `debounce` - 防抖函数
- ✅ `throttle` - 节流函数
- ✅ `runIdleTask` - 使用 requestIdleCallback 执行低优先级任务
- ✅ `raf` - requestAnimationFrame 封装
- ✅ `preloadResource` - 资源预加载
- ✅ `prefetchResource` - 资源预取
- ✅ `observeIntersection` - Intersection Observer 懒加载
- ✅ `batchDOMUpdates` - 批量 DOM 更新
- ✅ `measurePerformance` - 性能测量（开发环境）
- ✅ `getDevicePerformanceLevel` - 设备性能检测
- ✅ `getPerformanceConfig` - 根据设备性能调整配置

## 性能指标预期

### 首屏加载
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TTI (Time to Interactive)**: < 3.5s

### 交互性能
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **动画帧率**: 60fps

### 资源优化
- **JavaScript 包大小**: 通过代码分割减少初始包大小
- **CSS 优化**: 自动优化和压缩
- **图片优化**: 自动格式转换和尺寸优化

## 最佳实践

### 1. 使用性能工具函数

```typescript
import { debounce, throttle, measurePerformance } from '@/lib/utils/performance';

// 防抖搜索
const debouncedSearch = debounce((value: string) => {
  // 搜索逻辑
}, 300);

// 性能测量（开发环境）
await measurePerformance('数据加载', async () => {
  await fetchData();
});
```

### 2. 使用 React 18 并发特性

```typescript
import { useTransition } from 'react';

const [isPending, startTransition] = useTransition();

// 非紧急更新
startTransition(() => {
  setState(newValue);
});
```

### 3. 优化图片加载

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="描述"
  width={800}
  height={600}
  priority // 首屏图片使用 priority
  placeholder="blur" // 使用模糊占位符
/>
```

### 4. 使用 Suspense 边界

```typescript
<Suspense fallback={<Skeleton />}>
  <LazyComponent />
</Suspense>
```

## 监控和调试

### 开发环境
- React Query DevTools 已集成
- 性能测量工具可用（`measurePerformance`）

### 生产环境
建议集成以下监控工具：
- Web Vitals 监控
- 错误追踪（Sentry 等）
- 性能分析工具

## 后续优化建议

1. **Service Worker**: 考虑添加 Service Worker 实现离线缓存
2. **虚拟滚动**: 对于大列表，考虑使用虚拟滚动
3. **图片懒加载**: 使用 Intersection Observer 实现图片懒加载
4. **预取策略**: 根据用户行为预取可能访问的页面
5. **Bundle 分析**: 定期分析 bundle 大小，识别优化机会

## 参考资源

- [Next.js 性能优化](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React 18 并发特性](https://react.dev/blog/2022/03/29/react-v18)
- [Web Vitals](https://web.dev/vitals/)
- [Ant Design 性能优化](https://ant.design/docs/react/getting-started#Performance)

