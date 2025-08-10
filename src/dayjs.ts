/**
 * Day.js 工具 - 轻量级日期处理库
 * 提供原生 dayjs 实例，用户可根据需要自行扩展插件
 */

import * as dayjs from 'dayjs';

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

// 导出原生 dayjs，用户可以直接使用所有 dayjs API
export { dayjs };
export default dayjs;

// 重新导出 dayjs 的类型，方便用户使用
export type { ConfigType, Dayjs } from 'dayjs';
