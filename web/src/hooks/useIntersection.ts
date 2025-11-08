import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface IntersectionOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
  skip?: boolean;
  initialInView?: boolean;
  fallbackInView?: boolean;
  trackVisibility?: boolean;
  delay?: number;
}

/**
 * 元素可见性检测 Hook
 * @param options Intersection Observer 选项
 * @returns {ref, inView, entry} - ref用于绑定元素，inView表示是否可见，entry是观察器条目
 */
export function useIntersection(options?: IntersectionOptions) {
  const { ref, inView, entry } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    ...options,
  });

  return { ref, inView, entry };
}

/**
 * 懒加载 Hook - 当元素进入视口时加载内容
 */
export function useLazyLoad<T>(data: T | null, options?: IntersectionOptions) {
  const { ref, inView } = useIntersection(options);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (inView && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [inView, shouldLoad]);

  return { ref, shouldLoad: shouldLoad || !!data };
}
