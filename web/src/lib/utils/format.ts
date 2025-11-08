import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';

/**
 * 格式化日期为相对时间（如：3天前）
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: zhCN,
    });
  } catch {
    return '';
  }
}

/**
 * 格式化日期为完整时间（如：2024年1月1日 12:00）
 */
export function formatFullTime(date: string | Date): string {
  try {
    return format(new Date(date), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  } catch {
    return '';
  }
}

/**
 * 格式化数字（如：1000 -> 1k）
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
