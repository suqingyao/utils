# outils

个人常用工具函数库，基于 TypeScript 实现，无关业务和框架。

## 特性

- 🚀 **TypeScript 优先** - 完整的类型定义和智能提示
- 📦 **模块化设计** - 支持按需导入，减少打包体积
- 🧪 **完整测试** - 高测试覆盖率，确保代码质量
- 📚 **详细文档** - 完整的 API 文档和使用示例
- 🔧 **开箱即用** - 支持 ESM 和 CJS 两种格式
- 🎯 **无框架依赖** - 可在任何 JavaScript/TypeScript 项目中使用

## 安装

```bash
npm install outils
# 或
yarn add outils
# 或
pnpm add outils
```

## 快速开始

```typescript
import { debounce, EventEmitter, randomString, cn } from 'outils';

// 防抖函数
const debouncedFn = debounce(() => {
  console.log('执行防抖函数');
}, 300);

// 发布订阅
const emitter = new EventEmitter();
emitter.on('test', (data) => {
  console.log('接收到数据:', data);
});
emitter.emit('test', 'Hello World');

// 随机字符串
const id = randomString(10);
console.log('随机ID:', id);

// 类名合并
const className = cn('base-class', {
  'active': true,
  'disabled': false
});
```

## 主要功能

### 发布订阅模式

```typescript
import { EventEmitter } from 'outils';

const emitter = new EventEmitter();

// 订阅事件
const unsubscribe = emitter.on('message', (data) => {
  console.log('收到消息:', data);
});

// 发布事件
emitter.emit('message', 'Hello World');

// 取消订阅
unsubscribe();
```

### 防抖和节流

```typescript
import { debounce, throttle } from 'outils';

// 防抖
const debouncedFn = debounce((value) => {
  console.log('搜索:', value);
}, 300);

// 节流
const throttledFn = throttle(() => {
  console.log('滚动事件');
}, 100);
```

### 函数式编程

```typescript
import { curry, compose, pipe } from 'outils';

// 柯里化
const add = curry((a, b, c) => a + b + c);
const addOne = add(1);
const addOneTwo = addOne(2);
const result = addOneTwo(3); // 6

// 函数组合
const multiply = (x) => x * 2;
const addTen = (x) => x + 10;
const composed = compose(multiply, addTen);
const result2 = composed(5); // 30
```

### 并发控制

```typescript
import { concurrency, retry, withTimeout } from 'outils';

// 并发控制
const controller = concurrency(3);
const tasks = Array.from({ length: 10 }, (_, i) =>
  () => fetch(`/api/data/${i}`)
);

tasks.forEach(task => {
  controller.execute(task).then(result => {
    console.log('任务完成:', result);
  });
});

// 重试机制
const result = await retry(
  () => fetch('/api/unstable'),
  3, // 最大重试3次
  1000 // 重试间隔1秒
);

// 超时控制
const result2 = await withTimeout(
  () => fetch('/api/slow'),
  5000 // 5秒超时
);
```

### 类型工具

```typescript
import { isString, isArray, isEmpty, safeJsonParse } from 'outils';

if (isString(value)) {
  // TypeScript 知道 value 是 string 类型
  console.log(value.toUpperCase());
}

if (isArray(value)) {
  // TypeScript 知道 value 是数组类型
  console.log(value.length);
}

const data = safeJsonParse(jsonString, {});
```

### 环境工具

```typescript
import { isBrowser, isNode, isMobile, getOS } from 'outils';

if (isBrowser()) {
  // 浏览器环境
  console.log('运行在浏览器中');
}

if (isNode()) {
  // Node.js 环境
  console.log('运行在 Node.js 中');
}

if (isMobile()) {
  // 移动设备
  console.log('移动设备访问');
}

const os = getOS(); // 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown'
```

### 随机工具

```typescript
import {
  randomString,
  randomInt,
  randomColor,
  randomUUID,
  randomChoice,
  shuffle
} from 'outils';

const id = randomString(10); // 随机字符串
const num = randomInt(1, 100); // 1-100的随机整数
const color = randomColor(); // 随机颜色 #RRGGBB
const uuid = randomUUID(); // UUID v4
const item = randomChoice(['a', 'b', 'c']); // 随机选择
const shuffled = shuffle([1, 2, 3, 4, 5]); // 打乱数组
```

### 样式工具

```typescript
import { cn, conditionalClass, createVariants } from 'outils';

// 基础用法
const className = cn(
  'base-class',
  'text-blue-500',
  {
    'bg-red-500': isError,
    'bg-green-500': isSuccess
  }
);

// 条件类名
const buttonClass = conditionalClass(
  isActive,
  'bg-blue-500 text-white',
  'bg-gray-200 text-gray-700'
);

// 变体系统
const button = createVariants('px-4 py-2 rounded', {
  variant: {
    primary: 'bg-blue-500 text-white',
    secondary: 'bg-gray-200 text-gray-700'
  },
  size: {
    sm: 'text-sm px-2 py-1',
    lg: 'text-lg px-6 py-3'
  }
});

const buttonClassName = button({
  variant: 'primary',
  size: 'lg'
});
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test

# 构建
npm run build

# 生成文档
npm run docs:dev
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License