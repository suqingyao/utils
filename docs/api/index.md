# API 参考

欢迎来到 outils API 文档！这里包含了所有可用函数的详细说明、参数、返回值和使用示例。

## 功能模块

### 🎯 核心功能

#### [发布订阅](/api/event-emitter)
实现观察者模式，支持事件的发布、订阅和取消订阅。

```typescript
import { EventEmitter } from 'outils';

const emitter = new EventEmitter();
emitter.on('message', (data) => console.log(data));
emitter.emit('message', 'Hello World!');
```

#### [防抖节流](/api/debounce-throttle)
性能优化工具，控制函数执行频率。

```typescript
import { debounce, throttle } from 'outils';

const debouncedFn = debounce(() => console.log('执行'), 300);
const throttledFn = throttle(() => console.log('执行'), 100);
```

#### [函数式编程](/api/functional)
柯里化、组合、管道等函数式编程工具。

```typescript
import { curry, compose, pipe } from 'outils';

const add = curry((a, b, c) => a + b + c);
const addFive = add(5);
```

#### [并发控制](/api/concurrency)
控制异步任务的并发数量，支持重试和超时。

```typescript
import { concurrency } from 'outils';

const controller = concurrency(3);
const results = await controller.run(tasks);
```

### 🛠️ 工具函数

#### [类型工具](/api/type-utils)
类型判断、转换和校验工具。

```typescript
import { isString, isNumber, isArray } from 'outils';

if (isString(value)) {
  // TypeScript 知道 value 是 string 类型
  console.log(value.toUpperCase());
}
```

#### [环境工具](/api/env-utils)
判断运行环境（浏览器、Node.js 等）。

```typescript
import { isBrowser, isNode, isServer } from 'outils';

if (isBrowser()) {
  // 浏览器环境特定代码
  window.localStorage.setItem('key', 'value');
}
```

#### [随机工具](/api/random-utils)
生成各种随机数据（字符串、颜色、日期等）。

```typescript
import { randomString, randomColor, randomUUID } from 'outils';

const id = randomString(10);
const color = randomColor();
const uuid = randomUUID();
```

#### [样式工具](/api/class-names)
基于 clsx 和 tailwind-merge 的类名合并工具。

```typescript
import { cn, createVariants } from 'outils';

const className = cn('base', { active: true }, 'extra');
```

## 导入方式

### 按需导入（推荐）

```typescript
// 导入特定函数
import { debounce, EventEmitter, randomString } from 'outils';
```

### 模块导入

```typescript
// 从特定模块导入
import { EventEmitter } from 'outils/event-emitter';
import { debounce } from 'outils/debounce';
```

### 全量导入

```typescript
// 导入所有功能（不推荐，会增加打包体积）
import * as outils from 'outils';
```

## 类型定义

outils 完全使用 TypeScript 编写，提供完整的类型定义。所有函数都有准确的类型注解，支持 IDE 智能提示和编译时类型检查。

### 泛型支持

许多函数支持泛型，提供更好的类型安全：

```typescript
// EventEmitter 支持事件类型定义
const emitter = new EventEmitter<{
  message: string;
  count: number;
}>();

// 类型安全的事件监听
emitter.on('message', (data) => {
  // data 自动推断为 string 类型
  console.log(data.toUpperCase());
});
```

### 类型守卫

类型工具函数作为类型守卫，帮助 TypeScript 进行类型收窄：

```typescript
function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript 知道这里 value 是 string
    return value.trim();
  }
  
  if (isNumber(value)) {
    // TypeScript 知道这里 value 是 number
    return value.toFixed(2);
  }
}
```

## 性能考虑

### 按需导入

为了获得最佳的打包体积，建议使用按需导入：

```typescript
// ✅ 好：只导入需要的函数
import { debounce } from 'outils';

// ❌ 不好：导入整个库
import * as outils from 'outils';
```

### 函数复用

对于需要多次使用的配置化函数，建议提前创建：

```typescript
// ✅ 好：复用防抖函数
const debouncedSearch = debounce(searchFunction, 300);

// 多次调用
debouncedSearch('query1');
debouncedSearch('query2');

// ❌ 不好：每次都创建新的防抖函数
debounce(searchFunction, 300)('query1');
debounce(searchFunction, 300)('query2');
```

## 浏览器兼容性

- **现代浏览器**: 支持 ES2020+ 特性的浏览器
- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5.0

如需支持旧版浏览器，请使用 Babel 等工具进行转译。

## 错误处理

大部分函数都包含适当的错误处理和边界情况处理：

```typescript
// 安全的类型检查
if (isArray(value)) {
  // 确保是数组后再操作
  value.forEach(item => console.log(item));
}

// 防抖函数会处理无效参数
const safeDebouncedFn = debounce(null, 300); // 不会抛出错误
```

## 贡献指南

如果你发现 API 文档有错误或需要改进，欢迎：

1. 在 [GitHub](https://github.com/suqingyao/outils) 上提交 Issue
2. 提交 Pull Request 改进文档
3. 参与讨论和建议新功能

---

选择一个模块开始探索 outils 的强大功能吧！