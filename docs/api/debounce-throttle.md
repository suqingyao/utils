# 防抖节流 (Debounce & Throttle)

防抖和节流是优化高频事件触发的重要技术，用于控制函数的执行频率。

## 导入

```typescript
import { debounce, throttle } from 'outils';
```

## 防抖 (Debounce)

防抖技术确保函数在停止调用后的指定时间内只执行一次。

### debounce(func, delay, options?)

创建一个防抖函数。

**参数：**
- `func: T` - 要防抖的函数
- `delay: number` - 延迟时间（毫秒）
- `options?: DebounceOptions` - 配置选项
  - `immediate?: boolean` - 是否立即执行，默认 `false`

**返回值：**
- `T & { cancel: () => void; flush: () => void }` - 防抖后的函数，附带取消和立即执行方法

### 基本用法

```typescript
import { debounce } from 'outils';

// 搜索输入防抖
const searchInput = document.getElementById('search') as HTMLInputElement;
const search = debounce((query: string) => {
  console.log('搜索:', query);
  // 执行搜索逻辑
}, 300);

searchInput.addEventListener('input', (e) => {
  search((e.target as HTMLInputElement).value);
});
```

### 立即执行模式

```typescript
// 立即执行，然后在延迟时间内忽略后续调用
const saveData = debounce(
  (data: any) => {
    console.log('保存数据:', data);
  },
  1000,
  { immediate: true }
);

// 第一次调用立即执行
saveData({ id: 1 }); // 立即执行
saveData({ id: 2 }); // 被忽略
saveData({ id: 3 }); // 被忽略

// 1秒后可以再次立即执行
setTimeout(() => {
  saveData({ id: 4 }); // 立即执行
}, 1100);
```

### 取消和立即执行

```typescript
const debouncedFn = debounce(() => {
  console.log('执行函数');
}, 1000);

// 调用函数
debouncedFn();

// 取消执行
debouncedFn.cancel();

// 立即执行（如果有待执行的调用）
debouncedFn();
debouncedFn.flush(); // 立即执行，不等待延迟
```

### React 中的使用

```typescript
import React, { useState, useCallback } from 'react';
import { debounce } from 'outils';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // 使用 useCallback 确保防抖函数不会在每次渲染时重新创建
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim()) {
        const response = await fetch(`/api/search?q=${searchQuery}`);
        const data = await response.json();
        setResults(data);
      } else {
        setResults([]);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="搜索..."
      />
      <ul>
        {results.map((result: any) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 节流 (Throttle)

节流技术确保函数在指定时间间隔内最多执行一次。

### throttle(func, delay, options?)

创建一个节流函数。

**参数：**
- `func: T` - 要节流的函数
- `delay: number` - 节流时间间隔（毫秒）
- `options?: ThrottleOptions` - 配置选项
  - `leading?: boolean` - 是否在开始时立即执行，默认 `true`
  - `trailing?: boolean` - 是否在结束时执行，默认 `true`

**返回值：**
- `T & { cancel: () => void; flush: () => void }` - 节流后的函数，附带取消和立即执行方法

### 基本用法

```typescript
import { throttle } from 'outils';

// 滚动事件节流
const handleScroll = throttle(() => {
  console.log('滚动位置:', window.scrollY);
  // 执行滚动处理逻辑
}, 100);

window.addEventListener('scroll', handleScroll);
```

### 配置选项

```typescript
// 只在开始时执行，结束时不执行
const leadingOnly = throttle(
  () => console.log('只在开始执行'),
  1000,
  { leading: true, trailing: false }
);

// 只在结束时执行，开始时不执行
const trailingOnly = throttle(
  () => console.log('只在结束执行'),
  1000,
  { leading: false, trailing: true }
);

// 既不在开始也不在结束执行（实际上会在中间执行）
const neitherLeadingNorTrailing = throttle(
  () => console.log('中间执行'),
  1000,
  { leading: false, trailing: false }
);
```

### 鼠标移动事件

```typescript
const handleMouseMove = throttle((e: MouseEvent) => {
  console.log(`鼠标位置: (${e.clientX}, ${e.clientY})`);
  // 更新鼠标位置显示
}, 16); // 约 60fps

document.addEventListener('mousemove', handleMouseMove);
```

### 窗口大小调整

```typescript
const handleResize = throttle(() => {
  console.log(`窗口大小: ${window.innerWidth}x${window.innerHeight}`);
  // 重新计算布局
}, 250);

window.addEventListener('resize', handleResize);
```

### 取消和立即执行

```typescript
const throttledFn = throttle(() => {
  console.log('执行函数');
}, 1000);

// 调用函数
throttledFn();

// 取消执行
throttledFn.cancel();

// 立即执行（如果有待执行的调用）
throttledFn();
throttledFn.flush(); // 立即执行，不等待延迟
```

## 防抖 vs 节流

### 使用场景对比

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 搜索输入 | 防抖 | 用户停止输入后再搜索 |
| 按钮点击 | 防抖 | 防止重复提交 |
| 滚动事件 | 节流 | 保持流畅的滚动体验 |
| 鼠标移动 | 节流 | 保持响应性 |
| 窗口调整 | 节流 | 避免频繁重绘 |
| 表单验证 | 防抖 | 用户停止输入后验证 |
| 游戏控制 | 节流 | 保持固定的响应频率 |

### 可视化对比

```typescript
// 模拟高频事件
function simulateEvents() {
  const events = [];
  
  // 防抖：只有最后一次调用会执行
  const debouncedHandler = debounce(() => {
    events.push('防抖执行');
  }, 100);
  
  // 节流：每100ms最多执行一次
  const throttledHandler = throttle(() => {
    events.push('节流执行');
  }, 100);
  
  // 模拟连续触发
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      debouncedHandler();
      throttledHandler();
    }, i * 10);
  }
  
  // 100ms后查看结果
  setTimeout(() => {
    console.log(events);
    // 可能的输出：['节流执行', '防抖执行']
    // 节流可能执行多次，防抖只执行一次
  }, 200);
}
```

## 高级用法

### 带返回值的防抖

```typescript
const expensiveCalculation = debounce((x: number, y: number): number => {
  console.log('执行复杂计算');
  return x * y + Math.random();
}, 500);

// 注意：防抖函数的返回值可能不是最新的
const result = expensiveCalculation(10, 20);
console.log(result); // 可能是 undefined 或之前的结果
```

### 异步函数的防抖

```typescript
const fetchData = debounce(async (id: string) => {
  console.log('获取数据:', id);
  const response = await fetch(`/api/data/${id}`);
  return response.json();
}, 300);

// 使用异步防抖函数
fetchData('123'); // 这个调用可能被取消
fetchData('456'); // 这个调用可能被取消
fetchData('789'); // 这个调用会执行
```

### 动态延迟

```typescript
function createAdaptiveDebounce<T extends (...args: any[]) => any>(
  func: T,
  getDelay: (...args: Parameters<T>) => number
) {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const delay = getDelay(...args);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  } as T;
}

// 根据输入长度调整延迟
const adaptiveSearch = createAdaptiveDebounce(
  (query: string) => console.log('搜索:', query),
  (query: string) => query.length < 3 ? 500 : 200
);
```

### 组合使用

```typescript
// 先节流再防抖
function createThrottledDebounce<T extends (...args: any[]) => any>(
  func: T,
  throttleDelay: number,
  debounceDelay: number
) {
  const throttled = throttle(func, throttleDelay);
  return debounce(throttled, debounceDelay);
}

const complexHandler = createThrottledDebounce(
  (data: any) => console.log('处理数据:', data),
  100, // 节流100ms
  300  // 防抖300ms
);
```

## 性能优化建议

### 1. 合理选择延迟时间

```typescript
// ✅ 好：根据场景选择合适的延迟
const searchDebounce = debounce(search, 300);     // 搜索
const scrollThrottle = throttle(onScroll, 16);    // 滚动 (~60fps)
const resizeThrottle = throttle(onResize, 250);   // 窗口调整
const saveDebounce = debounce(saveData, 1000);    // 自动保存

// ❌ 不好：延迟时间过短或过长
const tooFast = debounce(search, 10);    // 太快，没有效果
const tooSlow = debounce(search, 5000);  // 太慢，用户体验差
```

### 2. 及时清理

```typescript
// ✅ 好：在组件卸载时清理
class Component {
  private debouncedSave = debounce(this.save.bind(this), 1000);
  
  destroy() {
    this.debouncedSave.cancel();
  }
}

// ✅ 好：在 React 中使用 useEffect 清理
function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
) {
  const debouncedFn = useMemo(
    () => debounce(func, delay),
    [func, delay]
  );
  
  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);
  
  return debouncedFn;
}
```

### 3. 避免在渲染中创建

```typescript
// ❌ 不好：每次渲染都创建新的防抖函数
function BadComponent() {
  const [query, setQuery] = useState('');
  
  const handleSearch = debounce((q: string) => {
    // 搜索逻辑
  }, 300); // 每次渲染都会创建新的防抖函数
  
  return <input onChange={(e) => handleSearch(e.target.value)} />;
}

// ✅ 好：使用 useCallback 或 useMemo
function GoodComponent() {
  const [query, setQuery] = useState('');
  
  const handleSearch = useCallback(
    debounce((q: string) => {
      // 搜索逻辑
    }, 300),
    []
  );
  
  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

## 常见问题

### Q: 防抖函数的返回值为什么可能是 undefined？

A: 防抖函数可能不会立即执行，所以返回值可能是上一次执行的结果或 undefined。如果需要处理返回值，建议使用 Promise 或回调函数。

```typescript
// 使用 Promise 处理异步结果
const debouncedAsync = debounce(async (query: string) => {
  const result = await searchAPI(query);
  return result;
}, 300);

// 或者使用回调
const debouncedWithCallback = debounce((query: string, callback: (result: any) => void) => {
  const result = search(query);
  callback(result);
}, 300);
```

### Q: 如何在 TypeScript 中正确使用泛型？

A: 防抖和节流函数都支持完整的 TypeScript 类型推断：

```typescript
// 类型会被正确推断
const typedDebounce = debounce((x: number, y: string) => {
  return x.toString() + y;
}, 300);

// typedDebounce 的类型为：
// (x: number, y: string) => string & { cancel: () => void; flush: () => void }
```

### Q: 防抖和节流函数是否支持 this 绑定？

A: 是的，都支持正确的 this 绑定：

```typescript
class MyClass {
  value = 42;
  
  method = debounce(function(this: MyClass) {
    console.log(this.value); // 正确访问 this
  }, 300);
}

const instance = new MyClass();
instance.method(); // 输出: 42
```

## 浏览器兼容性

支持所有现代浏览器和 Node.js 环境：
- Chrome 1+
- Firefox 1+
- Safari 1+
- Edge 12+
- IE 9+
- Node.js 0.10+

依赖的 API：
- `setTimeout` / `clearTimeout`
- `Date.now()`
- `Function.prototype.apply`