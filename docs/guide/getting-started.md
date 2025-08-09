# 快速开始

本指南将帮助你快速上手 outils，了解基本用法和核心功能。

## 基本导入

### 按需导入（推荐）

```typescript
// 只导入需要的函数
import { debounce, throttle, EventEmitter } from 'outils';
```

### 全量导入

```typescript
// 导入所有功能
import * as outils from 'outils';

const debouncedFn = outils.debounce(() => {
  console.log('Hello');
}, 300);
```

### 模块导入

```typescript
// 从特定模块导入
import { EventEmitter } from 'outils/event-emitter';
import { debounce } from 'outils/debounce';
```

## 核心功能示例

### 1. 防抖和节流

```typescript
import { debounce, throttle } from 'outils';

// 防抖：延迟执行，多次调用只执行最后一次
const debouncedSearch = debounce((query: string) => {
  console.log('搜索:', query);
}, 300);

// 节流：限制执行频率
const throttledScroll = throttle(() => {
  console.log('滚动事件');
}, 100);

// 使用
debouncedSearch('hello');
debouncedSearch('hello world'); // 只会执行这一次

throttledScroll(); // 立即执行
throttledScroll(); // 被节流，不会立即执行
```

### 2. 发布订阅模式

```typescript
import { EventEmitter } from 'outils';

// 创建事件发射器
const emitter = new EventEmitter();

// 订阅事件
const unsubscribe = emitter.on('message', (data) => {
  console.log('收到消息:', data);
});

// 发布事件
emitter.emit('message', 'Hello World!');

// 取消订阅
unsubscribe();

// 一次性订阅
emitter.once('init', () => {
  console.log('初始化完成');
});
```

### 3. 函数式编程

```typescript
import { curry, compose, pipe } from 'outils';

// 柯里化
const add = curry((a: number, b: number, c: number) => a + b + c);
const add5 = add(5);
const add5And3 = add5(3);
const result = add5And3(2); // 10

// 函数组合
const multiply = (x: number) => x * 2;
const addOne = (x: number) => x + 1;

const composed = compose(multiply, addOne);
const piped = pipe(addOne, multiply);

console.log(composed(5)); // (5 + 1) * 2 = 12
console.log(piped(5)); // (5 + 1) * 2 = 12
```

### 4. 并发控制

```typescript
import { concurrency } from 'outils';

// 创建并发控制器，最多同时执行 3 个任务
const controller = concurrency(3);

// 添加任务
const tasks = Array.from({ length: 10 }, (_, i) => 
  () => fetch(`/api/data/${i}`)
);

// 执行所有任务，但最多同时执行 3 个
const results = await controller.run(tasks);
console.log('所有任务完成:', results);
```

### 5. 类型工具

```typescript
import { isString, isNumber, isArray, isObject } from 'outils';

// 类型判断
console.log(isString('hello')); // true
console.log(isNumber(42)); // true
console.log(isArray([1, 2, 3])); // true
console.log(isObject({})); // true

// 在条件语句中使用
function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript 知道这里 value 是 string 类型
    console.log(value.toUpperCase());
  } else if (isNumber(value)) {
    // TypeScript 知道这里 value 是 number 类型
    console.log(value.toFixed(2));
  }
}
```

### 6. 随机工具

```typescript
import { 
  randomString, 
  randomNumber, 
  randomColor, 
  randomDate,
  randomUUID 
} from 'outils';

// 生成随机字符串
const id = randomString(10); // 'aBc123XyZ9'

// 生成随机数字
const num = randomNumber(1, 100); // 1-100 之间的随机数

// 生成随机颜色
const color = randomColor(); // '#ff5733'

// 生成随机日期
const date = randomDate(new Date('2024-01-01'), new Date('2024-12-31'));

// 生成 UUID
const uuid = randomUUID(); // 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
```

### 7. 样式工具

```typescript
import { cn, createVariants } from 'outils';

// 合并类名
const className = cn(
  'base-class',
  {
    'active': true,
    'disabled': false,
  },
  'additional-class'
);
// 结果: 'base-class active additional-class'

// 创建变体样式
const buttonVariants = createVariants({
  base: 'px-4 py-2 rounded font-medium',
  variants: {
    variant: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-900',
    },
    size: {
      sm: 'text-sm px-2 py-1',
      lg: 'text-lg px-6 py-3',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'sm',
  },
});

const buttonClass = buttonVariants({
  variant: 'secondary',
  size: 'lg',
});
```

## 在不同环境中使用

### React 项目

```tsx
import React, { useState, useCallback } from 'react';
import { debounce } from 'outils';

function SearchComponent() {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      // 执行搜索
      console.log('搜索:', searchQuery);
    }, 300),
    []
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return (
    <input
      type="text"
      value={query}
      onChange={handleInputChange}
      placeholder="搜索..."
    />
  );
}
```

### Vue 项目

```vue
<template>
  <input
    v-model="query"
    @input="handleInput"
    placeholder="搜索..."
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { debounce } from 'outils';

const query = ref('');

const debouncedSearch = debounce((searchQuery: string) => {
  console.log('搜索:', searchQuery);
}, 300);

const handleInput = () => {
  debouncedSearch(query.value);
};
</script>
```

### Node.js 项目

```typescript
import { EventEmitter, concurrency } from 'outils';
import fs from 'fs/promises';

// 事件驱动的文件处理
const fileProcessor = new EventEmitter();

fileProcessor.on('file:process', async (filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    console.log(`处理文件: ${filePath}`);
    fileProcessor.emit('file:processed', { filePath, content });
  } catch (error) {
    fileProcessor.emit('file:error', { filePath, error });
  }
});

// 并发处理多个文件
const controller = concurrency(5);
const filePaths = ['file1.txt', 'file2.txt', 'file3.txt'];

const tasks = filePaths.map(filePath => 
  () => fileProcessor.emit('file:process', filePath)
);

await controller.run(tasks);
```

## 下一步

现在你已经了解了 outils 的基本用法，可以：

1. 查看 [API 文档](/api/) 了解所有可用的函数
2. 浏览具体的功能模块文档
3. 查看 [GitHub 仓库](https://github.com/suqingyao/outils) 获取更多示例
4. 参与贡献或提出问题

## 常见问题

### Q: 如何减少打包体积？

A: 使用按需导入，只导入你需要的函数：

```typescript
// ✅ 推荐：按需导入
import { debounce } from 'outils';

// ❌ 不推荐：全量导入
import * as outils from 'outils';
```

### Q: 如何在 TypeScript 中获得更好的类型提示？

A: 确保你的 TypeScript 版本 >= 4.5.0，并在 `tsconfig.json` 中启用严格模式：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Q: 可以在浏览器中直接使用吗？

A: 可以，outils 支持现代浏览器。如果需要支持旧浏览器，请使用 Babel 进行转译。