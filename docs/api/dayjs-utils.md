# Day.js 工具 (Dayjs Utils)

轻量级日期处理库，提供原生 Day.js 实例。用户可以根据需要自行扩展插件，保持最大的灵活性和最小的包体积。

## 设计理念

- **最小封装**：直接导出原生 dayjs，保持 API 的完整性
- **按需扩展**：插件由用户根据实际需求自行安装和配置
- **类型安全**：完整的 TypeScript 类型支持
- **轻量级**：避免不必要的依赖和封装

## 导入

```typescript
import { dayjs, DATE_FORMATS } from 'outils';
import type { Dayjs, ConfigType } from 'outils';

// 或者直接导入 dayjs
import dayjs from 'outils/dayjs-utils';
```

## 基本使用

### 创建日期实例

```typescript
// 当前时间
const now = dayjs();

// 从字符串创建
const date1 = dayjs('2023-12-25');
const date2 = dayjs('2023-12-25 10:30:00');

// 从时间戳创建
const date3 = dayjs(1640419200000);

// 从 Date 对象创建
const date4 = dayjs(new Date());
```

### 格式化日期

```typescript
const date = dayjs('2023-12-25 10:30:00');

// 使用预定义格式
console.log(date.format(DATE_FORMATS.DATE)); // '2023-12-25'
console.log(date.format(DATE_FORMATS.DATETIME)); // '2023-12-25 10:30:00'
console.log(date.format(DATE_FORMATS.CHINESE_DATE)); // '2023年12月25日'

// 自定义格式
console.log(date.format('YYYY/MM/DD')); // '2023/12/25'
console.log(date.format('MMM DD, YYYY')); // 'Dec 25, 2023'
```

### 日期操作

```typescript
const date = dayjs('2023-12-25');

// 加法
const nextWeek = date.add(1, 'week');
const nextMonth = date.add(1, 'month');
const nextYear = date.add(1, 'year');

// 减法
const lastWeek = date.subtract(1, 'week');
const lastMonth = date.subtract(1, 'month');

// 获取开始/结束时间
const startOfDay = date.startOf('day');
const endOfMonth = date.endOf('month');
const startOfYear = date.startOf('year');
```

### 日期比较

```typescript
const date1 = dayjs('2023-12-25');
const date2 = dayjs('2023-12-26');

// 基本比较
console.log(date1.isBefore(date2)); // true
console.log(date1.isAfter(date2)); // false
console.log(date1.isSame(date2)); // false

// 按单位比较
console.log(date1.isSame(date2, 'month')); // true
console.log(date1.isSame(date2, 'year')); // true
```

## 常用格式常量

```typescript
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',                    // 2023-12-25
  TIME: 'HH:mm:ss',                      // 10:30:00
  DATETIME: 'YYYY-MM-DD HH:mm:ss',       // 2023-12-25 10:30:00
  DATETIME_MINUTE: 'YYYY-MM-DD HH:mm',   // 2023-12-25 10:30
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',       // 2023-12-25T10:30:00.000Z
  CHINESE_DATE: 'YYYY年MM月DD日',         // 2023年12月25日
  CHINESE_DATETIME: 'YYYY年MM月DD日 HH:mm:ss', // 2023年12月25日 10:30:00
  MONTH_DAY: 'MM-DD',                    // 12-25
  YEAR_MONTH: 'YYYY-MM',                 // 2023-12
} as const;
```

## 插件扩展

根据需要安装和使用 Day.js 插件：

### 相对时间插件

```typescript
import { dayjs } from 'outils';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn'; // 中文语言包

// 扩展插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 使用相对时间
const date = dayjs('2023-12-20');
console.log(date.fromNow()); // '5天前'
console.log(date.from(dayjs('2023-12-25'))); // '5天前'
```

### 时区插件

```typescript
import { dayjs } from 'outils';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 使用时区功能
const date = dayjs('2023-12-25 10:30:00');
console.log(date.tz('America/New_York').format()); // 转换到纽约时区
console.log(date.utc().format()); // 转换到 UTC
```

### 持续时间插件

```typescript
import { dayjs } from 'outils';
import duration from 'dayjs/plugin/duration';

// 扩展插件
dayjs.extend(duration);

// 使用持续时间
const dur = dayjs.duration(2, 'hours');
console.log(dur.humanize()); // '2 hours'
console.log(dur.asMinutes()); // 120

// 计算两个日期的差值
const date1 = dayjs('2023-12-25 10:00:00');
const date2 = dayjs('2023-12-25 12:30:00');
const diff = dayjs.duration(date2.diff(date1));
console.log(diff.humanize()); // '3 hours'
```

### 高级比较插件

```typescript
import { dayjs } from 'outils';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';

// 扩展插件
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

// 使用高级比较
const date = dayjs('2023-12-25');
const start = dayjs('2023-12-20');
const end = dayjs('2023-12-30');

console.log(date.isSameOrBefore(end)); // true
console.log(date.isSameOrAfter(start)); // true
console.log(date.isBetween(start, end)); // true
```

## 实际应用示例

### 日期范围选择器

```typescript
import { dayjs, DATE_FORMATS } from 'outils';

function createDateRange(start: string, end: string) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const dates = [];
  
  let current = startDate;
  while (current.isSameOrBefore(endDate, 'day')) {
    dates.push(current.format(DATE_FORMATS.DATE));
    current = current.add(1, 'day');
  }
  
  return dates;
}

const range = createDateRange('2023-12-20', '2023-12-25');
console.log(range); // ['2023-12-20', '2023-12-21', ...]
```

### 工作日计算

```typescript
import { dayjs } from 'outils';

function getWorkdays(start: string, end: string) {
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  const workdays = [];
  
  let current = startDate;
  while (current.isSameOrBefore(endDate, 'day')) {
    // 0 = Sunday, 6 = Saturday
    if (current.day() !== 0 && current.day() !== 6) {
      workdays.push(current.format('YYYY-MM-DD'));
    }
    current = current.add(1, 'day');
  }
  
  return workdays;
}
```

### 年龄计算

```typescript
import { dayjs } from 'outils';

function calculateAge(birthDate: string) {
  const birth = dayjs(birthDate);
  const now = dayjs();
  
  return now.diff(birth, 'year');
}

function getDetailedAge(birthDate: string) {
  const birth = dayjs(birthDate);
  const now = dayjs();
  
  const years = now.diff(birth, 'year');
  const months = now.diff(birth.add(years, 'year'), 'month');
  const days = now.diff(birth.add(years, 'year').add(months, 'month'), 'day');
  
  return { years, months, days };
}
```

## 类型定义

```typescript
// 从 dayjs 重新导出的类型
export type { Dayjs, ConfigType } from 'dayjs';

// 日期格式常量类型
export type DateFormat = typeof DATE_FORMATS[keyof typeof DATE_FORMATS];
```

## 最佳实践

1. **按需加载插件**：只安装和扩展你实际需要的插件
2. **统一格式化**：使用 `DATE_FORMATS` 常量保持格式一致性
3. **类型安全**：充分利用 TypeScript 类型检查
4. **性能考虑**：Day.js 实例是不可变的，链式调用会创建新实例
5. **时区处理**：需要时区功能时才扩展相关插件

## 常用插件列表

- `relativeTime` - 相对时间显示
- `utc` - UTC 时间支持
- `timezone` - 时区转换
- `duration` - 持续时间计算
- `isSameOrBefore` - 日期比较扩展
- `isSameOrAfter` - 日期比较扩展
- `isBetween` - 范围判断
- `weekOfYear` - 年中周数
- `quarterOfYear` - 季度支持
- `customParseFormat` - 自定义解析格式

更多插件和详细文档请参考 [Day.js 官方文档](https://day.js.org/docs/en/plugin/plugin)。