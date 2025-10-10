/**
 * Day.js 工具 - 轻量级日期处理库
 * 提供原生 dayjs 实例，用户可根据需要自行扩展插件
 */

import dayjs from 'dayjs';

// 常用日期格式常量
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATETIME_MINUTE: 'YYYY-MM-DD HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  CHINESE_DATE: 'YYYY年MM月DD日',
  CHINESE_DATETIME: 'YYYY年MM月DD日 HH:mm:ss',
  MONTH_DAY: 'MM-DD',
  YEAR_MONTH: 'YYYY-MM',
} as const;

export function formatDate(
  time: number | string,
  format = DATE_FORMATS.DATE as string,
) {
  try {
    const date = dayjs(time);

    if (!date.isValid()) {
      throw new Error('Invalid date time');
    }
    return date.format(format);
  }
  catch (error) {
    console.error(`Error formatting date: ${error}`);
    return time;
  }
}

export function formatDateTime(time: number | string) {
  return formatDate(time, DATE_FORMATS.DATETIME);
}

export function isDayjsObject(value: any): value is dayjs.Dayjs {
  return dayjs.isDayjs(value);
}

export { dayjs };
export default dayjs;

// 重新导出 dayjs 的类型，方便用户使用
export type { ConfigType, Dayjs } from 'dayjs';
