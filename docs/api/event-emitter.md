# 发布订阅 (EventEmitter)

实现观察者模式的事件发布订阅器，支持事件的发布、订阅、取消订阅等功能。

## 导入

```typescript
import { EventEmitter, createEventEmitter } from 'outils';
```

## EventEmitter 类

### 构造函数

```typescript
const emitter = new EventEmitter();
```

### 方法

#### on(event, callback)

订阅事件。

**参数：**
- `event: string` - 事件名称
- `callback: (data: T) => void` - 回调函数

**返回值：**
- `() => void` - 取消订阅的函数

**示例：**

```typescript
const emitter = new EventEmitter();

// 订阅事件
const unsubscribe = emitter.on('message', (data) => {
  console.log('收到消息:', data);
});

// 发布事件
emitter.emit('message', 'Hello World!');

// 取消订阅
unsubscribe();
```

**TypeScript 类型支持：**

```typescript
// 带类型的事件监听
const emitter = new EventEmitter();

// 明确指定数据类型
emitter.on<string>('message', (data) => {
  // data 类型为 string
  console.log(data.toUpperCase());
});

emitter.on<number>('count', (data) => {
  // data 类型为 number
  console.log(data.toFixed(2));
});
```

#### once(event, callback)

订阅一次性事件，回调函数只会执行一次。

**参数：**
- `event: string` - 事件名称
- `callback: (data: T) => void` - 回调函数

**返回值：**
- `() => void` - 取消订阅的函数

**示例：**

```typescript
const emitter = new EventEmitter();

// 只监听一次
emitter.once('init', () => {
  console.log('初始化完成');
});

// 第一次触发，会执行回调
emitter.emit('init');

// 第二次触发，不会执行回调
emitter.emit('init');
```

#### off(event, callback?)

取消订阅事件。

**参数：**
- `event: string` - 事件名称
- `callback?: (data: T) => void` - 要取消的回调函数，可选

**行为：**
- 如果提供 `callback`，只取消该特定回调
- 如果不提供 `callback`，取消该事件的所有订阅

**示例：**

```typescript
const emitter = new EventEmitter();

const callback1 = (data) => console.log('回调1:', data);
const callback2 = (data) => console.log('回调2:', data);

emitter.on('test', callback1);
emitter.on('test', callback2);

// 只取消 callback1
emitter.off('test', callback1);

// 取消该事件的所有订阅
emitter.off('test');
```

#### emit(event, data?)

发布事件，触发所有订阅该事件的回调函数。

**参数：**
- `event: string` - 事件名称
- `data?: T` - 传递给回调函数的数据，可选

**示例：**

```typescript
const emitter = new EventEmitter();

emitter.on('message', (data) => {
  console.log('收到:', data);
});

// 发布带数据的事件
emitter.emit('message', 'Hello World!');

// 发布不带数据的事件
emitter.emit('ready');
```

**错误处理：**

```typescript
const emitter = new EventEmitter();

// 如果回调函数抛出错误，不会影响其他回调的执行
emitter.on('test', () => {
  throw new Error('回调错误');
});

emitter.on('test', () => {
  console.log('这个回调仍会执行');
});

emitter.emit('test'); // 错误会被捕获并打印到控制台
```

#### listenerCount(event)

获取指定事件的订阅者数量。

**参数：**
- `event: string` - 事件名称

**返回值：**
- `number` - 订阅者数量

**示例：**

```typescript
const emitter = new EventEmitter();

emitter.on('test', () => {});
emitter.on('test', () => {});

console.log(emitter.listenerCount('test')); // 2
console.log(emitter.listenerCount('nonexistent')); // 0
```

#### eventNames()

获取所有已注册事件的名称。

**返回值：**
- `string[]` - 事件名称数组

**示例：**

```typescript
const emitter = new EventEmitter();

emitter.on('event1', () => {});
emitter.on('event2', () => {});

console.log(emitter.eventNames()); // ['event1', 'event2']
```

#### clear()

清除所有事件订阅。

**示例：**

```typescript
const emitter = new EventEmitter();

emitter.on('event1', () => {});
emitter.on('event2', () => {});

console.log(emitter.eventNames()); // ['event1', 'event2']

emitter.clear();

console.log(emitter.eventNames()); // []
```

## 工具函数

### createEventEmitter()

创建一个新的 EventEmitter 实例。

**返回值：**
- `EventEmitter` - 新的 EventEmitter 实例

**示例：**

```typescript
import { createEventEmitter } from 'outils';

const emitter = createEventEmitter();
emitter.on('test', (data) => console.log(data));
```

## 高级用法

### 类型安全的事件系统

```typescript
// 定义事件类型映射
interface AppEvents {
  'user:login': { userId: string; username: string };
  'user:logout': { userId: string };
  'message:received': { from: string; content: string; timestamp: number };
  'app:ready': void;
}

// 创建类型安全的事件发射器
class TypedEventEmitter {
  private emitter = new EventEmitter();
  
  on<K extends keyof AppEvents>(
    event: K,
    callback: AppEvents[K] extends void 
      ? () => void 
      : (data: AppEvents[K]) => void
  ) {
    return this.emitter.on(event, callback);
  }
  
  emit<K extends keyof AppEvents>(
    event: K,
    ...args: AppEvents[K] extends void ? [] : [AppEvents[K]]
  ) {
    this.emitter.emit(event, args[0]);
  }
}

const typedEmitter = new TypedEventEmitter();

// 类型安全的事件监听
typedEmitter.on('user:login', (data) => {
  // data 类型自动推断为 { userId: string; username: string }
  console.log(`用户 ${data.username} 登录了`);
});

// 类型安全的事件发布
typedEmitter.emit('user:login', {
  userId: '123',
  username: 'john'
});
```

### 事件命名空间

```typescript
const emitter = new EventEmitter();

// 使用命名空间组织事件
emitter.on('user:created', (user) => {
  console.log('用户创建:', user);
});

emitter.on('user:updated', (user) => {
  console.log('用户更新:', user);
});

emitter.on('order:created', (order) => {
  console.log('订单创建:', order);
});

// 可以通过前缀批量处理事件
function handleUserEvents(event: string, data: any) {
  if (event.startsWith('user:')) {
    console.log('处理用户事件:', event, data);
  }
}
```

### 事件链和中间件

```typescript
class MiddlewareEventEmitter extends EventEmitter {
  private middlewares: Array<(event: string, data: any, next: () => void) => void> = [];
  
  use(middleware: (event: string, data: any, next: () => void) => void) {
    this.middlewares.push(middleware);
  }
  
  emit<T = any>(event: string, data?: T): void {
    let index = 0;
    
    const next = () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        middleware(event, data, next);
      } else {
        super.emit(event, data);
      }
    };
    
    next();
  }
}

const emitter = new MiddlewareEventEmitter();

// 添加日志中间件
emitter.use((event, data, next) => {
  console.log(`[LOG] 事件: ${event}, 数据:`, data);
  next();
});

// 添加验证中间件
emitter.use((event, data, next) => {
  if (event.startsWith('user:') && !data?.userId) {
    console.error('用户事件必须包含 userId');
    return;
  }
  next();
});

emitter.on('user:login', (data) => {
  console.log('用户登录处理:', data);
});

emitter.emit('user:login', { userId: '123' });
```

## 最佳实践

### 1. 及时清理订阅

```typescript
// ✅ 好：保存取消订阅函数并在适当时机调用
const unsubscribe = emitter.on('event', callback);

// 在组件卸载或不再需要时取消订阅
unsubscribe();

// ✅ 好：使用 once 对于一次性事件
emitter.once('init', () => {
  console.log('初始化完成');
});
```

### 2. 错误处理

```typescript
// ✅ 好：在回调中处理可能的错误
emitter.on('data', (data) => {
  try {
    processData(data);
  } catch (error) {
    console.error('处理数据时出错:', error);
  }
});
```

### 3. 事件命名约定

```typescript
// ✅ 好：使用清晰的事件命名
emitter.on('user:login:success', handleLoginSuccess);
emitter.on('user:login:failure', handleLoginFailure);
emitter.on('order:payment:completed', handlePaymentCompleted);

// ❌ 不好：模糊的事件名
emitter.on('success', handleSuccess);
emitter.on('error', handleError);
```

### 4. 避免内存泄漏

```typescript
// ✅ 好：在 React 组件中正确使用
function MyComponent() {
  useEffect(() => {
    const unsubscribe = emitter.on('data', handleData);
    
    // 清理函数
    return () => {
      unsubscribe();
    };
  }, []);
}

// ✅ 好：在 Vue 组件中正确使用
export default {
  mounted() {
    this.unsubscribe = emitter.on('data', this.handleData);
  },
  
  beforeUnmount() {
    this.unsubscribe?.();
  }
};
```

## 性能考虑

- EventEmitter 内部使用数组存储回调函数，查找和删除的时间复杂度为 O(n)
- 对于大量订阅者的场景，考虑使用 Map 或 Set 优化
- emit 时会复制回调数组，避免在回调中修改订阅列表导致的问题
- 错误处理不会中断其他回调的执行

## 浏览器兼容性

支持所有现代浏览器和 Node.js 环境，无需额外的 polyfill。