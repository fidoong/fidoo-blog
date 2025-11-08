import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/zh-cn';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.locale('zh-cn');

/**
 * 日期工具类
 */
export class DateUtil {
  /**
   * 格式化日期
   * @param date 日期
   * @param format 格式，默认 'YYYY-MM-DD HH:mm:ss'
   * @returns 格式化后的日期字符串
   */
  static format(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).format(format);
  }

  /**
   * 解析日期字符串
   * @param dateString 日期字符串
   * @returns Date 对象
   */
  static parse(dateString: string): Date {
    return dayjs(dateString).toDate();
  }

  /**
   * 获取当前时间
   * @returns Date 对象
   */
  static now(): Date {
    return dayjs().toDate();
  }

  /**
   * 获取今天的开始时间
   * @returns Date 对象
   */
  static startOfToday(): Date {
    return dayjs().startOf('day').toDate();
  }

  /**
   * 获取今天的结束时间
   * @returns Date 对象
   */
  static endOfToday(): Date {
    return dayjs().endOf('day').toDate();
  }

  /**
   * 获取指定日期的开始时间
   * @param date 日期
   * @returns Date 对象
   */
  static startOfDay(date: Date | string): Date {
    return dayjs(date).startOf('day').toDate();
  }

  /**
   * 获取指定日期的结束时间
   * @param date 日期
   * @returns Date 对象
   */
  static endOfDay(date: Date | string): Date {
    return dayjs(date).endOf('day').toDate();
  }

  /**
   * 添加时间
   * @param date 日期
   * @param amount 数量
   * @param unit 单位 (day, week, month, year, hour, minute, second)
   * @returns Date 对象
   */
  static add(date: Date | string, amount: number, unit: dayjs.ManipulateType): Date {
    return dayjs(date).add(amount, unit).toDate();
  }

  /**
   * 减去时间
   * @param date 日期
   * @param amount 数量
   * @param unit 单位
   * @returns Date 对象
   */
  static subtract(date: Date | string, amount: number, unit: dayjs.ManipulateType): Date {
    return dayjs(date).subtract(amount, unit).toDate();
  }

  /**
   * 计算两个日期之间的差值
   * @param date1 日期1
   * @param date2 日期2
   * @param unit 单位
   * @returns 差值
   */
  static diff(
    date1: Date | string,
    date2: Date | string,
    unit: dayjs.QUnitType | dayjs.OpUnitType = 'millisecond',
  ): number {
    return dayjs(date1).diff(dayjs(date2), unit);
  }

  /**
   * 判断日期是否在范围内
   * @param date 日期
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 是否在范围内
   */
  static isBetween(date: Date | string, startDate: Date | string, endDate: Date | string): boolean {
    return dayjs(date).isBetween(dayjs(startDate), dayjs(endDate));
  }

  /**
   * 获取相对时间（如：2小时前）
   * @param date 日期
   * @returns 相对时间字符串
   */
  static fromNow(date: Date | string): string {
    return dayjs(date).fromNow();
  }

  /**
   * 转换为 UTC 时间
   * @param date 日期
   * @returns UTC 日期字符串
   */
  static toUTC(date: Date | string): string {
    return dayjs(date).utc().format();
  }

  /**
   * 转换为指定时区
   * @param date 日期
   * @param timezone 时区，默认 'Asia/Shanghai'
   * @returns 时区日期字符串
   */
  static toTimezone(date: Date | string, timezone: string = 'Asia/Shanghai'): string {
    return dayjs(date).tz(timezone).format();
  }
}
