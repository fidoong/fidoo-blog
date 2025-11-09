/**
 * 防抖 Hook
 * 用于延迟执行函数，常用于搜索输入等场景
 */

import { useEffect, useState } from 'react';

/**
 * 防抖 Hook
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒），默认 300ms
 * @returns 防抖后的值
 *
 * @example
 * ```tsx
 * const [searchKeyword, setSearchKeyword] = useState('');
 * const debouncedKeyword = useDebounce(searchKeyword, 500);
 *
 * useEffect(() => {
 *   if (debouncedKeyword) {
 *     // 执行搜索
 *     search(debouncedKeyword);
 *   }
 * }, [debouncedKeyword]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
